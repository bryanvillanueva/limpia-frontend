import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, Alert, Button, Tooltip, Skeleton,
  ToggleButton, ToggleButtonGroup, Chip, alpha,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
} from '@mui/material';
import {
  Add, ChevronLeft, ChevronRight, CalendarMonth, EventNote,
  ViewWeek, ViewDay, PeopleAlt, Assessment,
} from '@mui/icons-material';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LogFormModal from './LogFormModal';
import GenerateLogReportModal from './GenerateLogReportModal';
import { getMyLogs, importFromTeammate } from '../../services/logs.service';
import { getMyTeam, getWeekPlan, getTeamSites } from '../../services/planner.service';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const CYCLE_WEEKS = [1, 2, 3, 4];

const TYPE_STYLES = {
  SERVICE: { bg: '#e8f5e9', fg: '#2e7d32', label: 'Service' },
  BINS:    { bg: '#e3f2fd', fg: '#1565c0', label: 'Bins' },
  CUSTOM:  { bg: '#fff3e0', fg: '#e65100', label: 'Otro' },
};

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDateLocal(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Returns the Monday of the week containing `date`, shifted by `offset` weeks. */
function getMonday(date, offset = 0) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon ...
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Solid chip for a logged entry. */
function LogChip({ log }) {
  const style = TYPE_STYLES[log.entry_type] || TYPE_STYLES.SERVICE;
  const value = Number(log.display_value || 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          bgcolor: style.bg,
          color: style.fg,
          borderRadius: 1,
          px: 0.75,
          py: 0.25,
          fontWeight: 600,
        }}
      >
        <Chip
          label={style.label}
          size="small"
          sx={{
            height: 18,
            fontSize: '0.6rem',
            fontWeight: 700,
            bgcolor: alpha(style.fg, 0.15),
            color: style.fg,
            '& .MuiChip-label': { px: 0.5 },
          }}
        />
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'inherit', lineHeight: 1, fontSize: '0.7rem' }}>
          {value.toFixed(2)}
        </Typography>
      </Box>
      {log.observaciones && (
        <Typography
          variant="caption"
          sx={{ fontSize: '0.6rem', color: 'text.secondary', lineHeight: 1.2, maxWidth: 100, textAlign: 'center' }}
          noWrap
        >
          {log.observaciones}
        </Typography>
      )}
    </Box>
  );
}

/** Faded indicator showing a planned (but not yet logged) entry. */
function PlannedIndicator({ item }) {
  const style = TYPE_STYLES[item.entry_type] || TYPE_STYLES.SERVICE;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        border: '1px dashed',
        borderColor: alpha(style.fg, 0.4),
        borderRadius: 1,
        px: 0.75,
        py: 0.25,
        opacity: 0.55,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600, color: style.fg, lineHeight: 1, fontSize: '0.6rem' }}>
        {style.label}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1, fontSize: '0.6rem' }}>
        planificado
      </Typography>
    </Box>
  );
}

export default function MisSitiosPage() {
  const [team, setTeam] = useState(null);
  const [cycleWeek, setCycleWeek] = useState(
    () => Number(localStorage.getItem('limpia_cycle_week')) || 1,
  );
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'day'
  const [dayOffset, setDayOffset] = useState(0);    // 0=today, -1=yesterday, +1=tomorrow...
  const [plannerData, setPlannerData] = useState([]);
  const [teamSites, setTeamSites] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSite, setModalSite] = useState(null);
  const [modalFecha, setModalFecha] = useState(null);
  const [modalPlannerEntry, setModalPlannerEntry] = useState(null);
  const [modalExistingLog, setModalExistingLog] = useState(null);
  const [modalKey, setModalKey] = useState(0);

  // Generate report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Import from teammate state
  const [importPreview, setImportPreview] = useState(null); // dry_run result
  const [importLoading, setImportLoading] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importSuccess, setImportSuccess] = useState('');

  // Persist cycle week selection
  useEffect(() => {
    localStorage.setItem('limpia_cycle_week', String(cycleWeek));
  }, [cycleWeek]);

  // Monday of the current display week
  const weekStart = useMemo(() => getMonday(new Date(), weekOffset), [weekOffset]);

  // Array of 7 dates for the week columns
  const weekDates = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    }),
  [weekStart]);

  // Index of today in the current week (0-6, or -1 if not this week)
  const todayIndex = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return weekDates.findIndex(d => d.toDateString() === today.toDateString());
  }, [weekDates]);

  // Week label for the header
  const weekLabel = useMemo(() => {
    const fmtShort = (d) => d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
    return `${fmtShort(weekDates[0])} — ${fmtShort(weekDates[6])}`;
  }, [weekDates]);

  // Day mode: selected date and its index within the current week
  const selectedDate = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [dayOffset]);

  const selectedDayIdx = useMemo(() => {
    return Math.round((selectedDate - weekStart) / 86400000);
  }, [selectedDate, weekStart]);

  const dayLabel = useMemo(() => {
    return selectedDate.toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit', month: '2-digit' });
  }, [selectedDate]);

  // Sync weekOffset when switching to day mode or navigating days
  useEffect(() => {
    if (viewMode !== 'day') return;
    const mondayOfDay = getMonday(selectedDate);
    const currentMonday = getMonday(new Date(), weekOffset);
    if (mondayOfDay.getTime() !== currentMonday.getTime()) {
      const diffWeeks = Math.round((mondayOfDay - getMonday(new Date())) / (7 * 86400000));
      setWeekOffset(diffWeeks);
    }
  }, [viewMode, selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load team on mount
  useEffect(() => {
    let cancelled = false;
    getMyTeam()
      .then(t => { if (!cancelled) setTeam(t); })
      .catch(() => setError('Error al detectar tu equipo'));
    return () => { cancelled = true; };
  }, []);

  // Load planner data when team or cycleWeek changes
  useEffect(() => {
    if (!team) return;
    let cancelled = false;
    Promise.all([
      getWeekPlan(team.team_id, cycleWeek),
      getTeamSites(team.team_id),
    ])
      .then(([grid, sites]) => {
        if (cancelled) return;
        setPlannerData(grid.plans || []);
        setTeamSites(sites || []);
      })
      .catch(() => {
        if (!cancelled) setError('Error al cargar el planner');
      });
    return () => { cancelled = true; };
  }, [team, cycleWeek]);

  // Load logs for the current week
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const allLogs = await getMyLogs();
      const startStr = formatDate(weekDates[0]);
      const endStr = formatDate(weekDates[6]);
      const weekLogs = (Array.isArray(allLogs) ? allLogs : []).filter(l => {
        const f = l.fecha?.slice(0, 10);
        return f >= startStr && f <= endStr;
      });
      setLogs(weekLogs);
    } catch {
      setError('Error al cargar tus registros');
    } finally {
      setLoading(false);
    }
  }, [weekDates]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  // Check if teammate has logs for this week (dry_run preview)
  const checkTeammateLogs = useCallback(async () => {
    setImportPreview(null);
    setImportSuccess('');
    try {
      const result = await importFromTeammate({
        fecha_inicio: formatDate(weekDates[0]),
        fecha_fin: formatDate(weekDates[6]),
        dry_run: true,
      });
      if (result.summary?.source_logs_total > 0) {
        setImportPreview(result);
      }
    } catch {
      // Silently ignore — teammate may not exist or no logs
    }
  }, [weekDates]);

  useEffect(() => { checkTeammateLogs(); }, [checkTeammateLogs]);

  // Execute the actual import
  const handleImport = async (overwrite = false) => {
    if (!importPreview) return;
    setImportLoading(true);
    try {
      const result = await importFromTeammate({
        source_user_id: importPreview.source_user.id,
        fecha_inicio: importPreview.fecha_inicio,
        fecha_fin: importPreview.fecha_fin,
        overwrite_existing: overwrite,
        dry_run: false,
      });
      const { created, updated } = result.summary;
      setImportSuccess(`Importados: ${created} creados, ${updated} actualizados`);
      setImportDialogOpen(false);
      setImportPreview(null);
      loadLogs();
    } catch {
      setError('Error al importar logs del compañero');
    } finally {
      setImportLoading(false);
    }
  };

  // Build grid rows: merge planner sites + logged sites
  const gridRows = useMemo(() => {
    const siteMap = new Map();

    // Add sites from planner
    for (const plan of plannerData) {
      siteMap.set(plan.site_id, {
        site_id: plan.site_id,
        site_name: plan.direccion_linea1 || `Sitio ${plan.site_id}`,
        suburb: plan.suburb,
        horas_por_trabajador: plan.horas_por_trabajador,
        hace_bins: plan.hace_bins,
        pago_bins: plan.pago_bins,
        // Planner items indexed by day_of_week (1-7) → mapped to 0-6
        plannerByDay: {},
      });
      for (const item of (plan.items || [])) {
        const dayIdx = item.day_of_week - 1; // 1=Mon→0, 7=Sun→6
        if (dayIdx >= 0 && dayIdx <= 6) {
          if (!siteMap.get(plan.site_id).plannerByDay[dayIdx]) {
            siteMap.get(plan.site_id).plannerByDay[dayIdx] = [];
          }
          siteMap.get(plan.site_id).plannerByDay[dayIdx].push(item);
        }
      }
    }

    // Add sites from logs that aren't in the planner
    // Build a lookup from teamSites for enrichment
    const teamSiteMap = new Map();
    for (const ts of teamSites) {
      teamSiteMap.set(ts.site_id, ts);
    }

    for (const log of logs) {
      if (!siteMap.has(log.site_id)) {
        const ts = teamSiteMap.get(log.site_id);
        siteMap.set(log.site_id, {
          site_id: log.site_id,
          site_name: log.sitio || ts?.direccion_linea1 || `Sitio ${log.site_id}`,
          suburb: log.suburb || ts?.suburb || null,
          horas_por_trabajador: ts?.horas_por_trabajador ?? null,
          hace_bins: ts?.hace_bins ?? null,
          pago_bins: ts?.pago_bins ?? null,
          plannerByDay: {},
        });
      }
    }

    return Array.from(siteMap.values());
  }, [plannerData, logs, teamSites]);

  // Build a lookup: siteId → dayIndex → logs[]
  const logsBySiteDay = useMemo(() => {
    const map = {};
    for (const log of logs) {
      const logDate = parseDateLocal(log.fecha.slice(0, 10));
      const diff = Math.round((logDate - weekStart) / 86400000);
      if (diff < 0 || diff > 6) continue;
      const key = `${log.site_id}_${diff}`;
      if (!map[key]) map[key] = [];
      map[key].push(log);
    }
    return map;
  }, [logs, weekStart]);

  // Day mode: count logs for the selected day
  const dayLogCount = useMemo(() => {
    if (viewMode !== 'day' || selectedDayIdx < 0 || selectedDayIdx > 6) return 0;
    return gridRows.reduce((sum, row) => {
      return sum + (logsBySiteDay[`${row.site_id}_${selectedDayIdx}`] || []).length;
    }, 0);
  }, [viewMode, selectedDayIdx, gridRows, logsBySiteDay]);

  // Day mode: filter grid rows to only those with activity on selected day
  const dayRows = useMemo(() => {
    if (viewMode !== 'day' || selectedDayIdx < 0 || selectedDayIdx > 6) return [];
    return gridRows.filter(row => {
      const hasLogs = (logsBySiteDay[`${row.site_id}_${selectedDayIdx}`] || []).length > 0;
      const hasPlanner = (row.plannerByDay[selectedDayIdx] || []).length > 0;
      return hasLogs || hasPlanner;
    });
  }, [viewMode, selectedDayIdx, gridRows, logsBySiteDay]);

  // Build enriched site object from a grid row
  const buildModalSite = (siteRow) => {
    const ts = teamSites.find(s => s.site_id === siteRow.site_id);
    return {
      site_id: siteRow.site_id,
      direccion_linea1: siteRow.site_name || ts?.direccion_linea1,
      suburb: siteRow.suburb || ts?.suburb,
      horas_por_trabajador: siteRow.horas_por_trabajador ?? ts?.horas_por_trabajador ?? null,
      hace_bins: siteRow.hace_bins ?? ts?.hace_bins ?? null,
      pago_bins: siteRow.pago_bins ?? ts?.pago_bins ?? null,
    };
  };

  // Open log modal for creating a new log in a specific cell
  const openModal = (siteRow, dayIdx, plannerItems) => {
    setModalSite(buildModalSite(siteRow));
    setModalFecha(formatDate(weekDates[dayIdx]));
    setModalPlannerEntry(plannerItems?.[0] || null);
    setModalExistingLog(null);
    setModalKey(k => k + 1);
    setModalOpen(true);
  };

  // Open modal for editing an existing log
  const openEditModal = (log, siteRow) => {
    setModalSite(buildModalSite(siteRow));
    setModalFecha(null);
    setModalPlannerEntry(null);
    setModalExistingLog(log);
    setModalKey(k => k + 1);
    setModalOpen(true);
  };

  // Open modal for "add custom" (no site pre-selected)
  const openCustomModal = () => {
    setModalSite(null);
    const defaultDate = viewMode === 'day'
      ? formatDate(selectedDate)
      : formatDate(weekDates[todayIndex >= 0 ? todayIndex : 0]);
    setModalFecha(defaultDate);
    setModalPlannerEntry(null);
    setModalExistingLog(null);
    setModalKey(k => k + 1);
    setModalOpen(true);
  };

  const handleSaved = () => {
    loadLogs();
  };

  const isCurrentWeek = weekOffset === 0;

  return (
    <>
      <PageHeader
        title="Registrar Logs"
        subtitle={team ? `Equipo ${team.team_numero ?? team.team_id}` : 'Cargando equipo...'}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Assessment />} onClick={() => setReportModalOpen(true)}>
              Generar reporte
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={openCustomModal}>
              Agregar log
            </Button>
          </Box>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {importSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setImportSuccess('')}>{importSuccess}</Alert>}

      {/* Teammate import banner */}
      {importPreview && (
        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: 2,
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.info.main, 0.3),
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.04),
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <PeopleAlt color="info" />
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="body2" fontWeight={600}>
              {importPreview.source_user.nombre} {importPreview.source_user.apellido} tiene{' '}
              {importPreview.summary.source_logs_total} log{importPreview.summary.source_logs_total !== 1 ? 's' : ''} esta semana
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {importPreview.summary.create_count > 0 && `${importPreview.summary.create_count} nuevo${importPreview.summary.create_count !== 1 ? 's' : ''}`}
              {importPreview.summary.create_count > 0 && importPreview.summary.update_count > 0 && ', '}
              {importPreview.summary.update_count > 0 && `${importPreview.summary.update_count} ya existente${importPreview.summary.update_count !== 1 ? 's' : ''}`}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setImportDialogOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Importar logs
          </Button>
          <IconButton size="small" onClick={() => setImportPreview(null)} sx={{ ml: -1 }}>
            <Typography variant="caption" color="text.secondary">✕</Typography>
          </IconButton>
        </Paper>
      )}

      {/* Controls bar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 3 }}>
        {/* View mode toggle */}
        <ToggleButtonGroup
          exclusive
          value={viewMode}
          onChange={(_, val) => { if (val != null) setViewMode(val); }}
          size="small"
        >
          <ToggleButton value="week" sx={{ px: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', gap: 0.5 }}>
            <ViewWeek fontSize="small" /> Semana
          </ToggleButton>
          <ToggleButton value="day" sx={{ px: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', gap: 0.5 }}>
            <ViewDay fontSize="small" /> Día
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Date navigation */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 0.5,
            py: 0.25,
          }}
        >
          <IconButton
            size="small"
            onClick={() => viewMode === 'day' ? setDayOffset(d => d - 1) : setWeekOffset(w => w - 1)}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
            <CalendarMonth color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight={600} sx={{ minWidth: 140, textAlign: 'center' }}>
              {viewMode === 'day' ? dayLabel : weekLabel}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => viewMode === 'day' ? setDayOffset(d => d + 1) : setWeekOffset(w => w + 1)}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
          {((viewMode === 'day' && dayOffset !== 0) || (viewMode === 'week' && !isCurrentWeek)) && (
            <Button
              size="small"
              onClick={() => viewMode === 'day' ? setDayOffset(0) : setWeekOffset(0)}
              sx={{ textTransform: 'none', ml: 0.5 }}
            >
              Hoy
            </Button>
          )}
        </Paper>

        {/* Cycle week selector (planner guide) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Semana del planner usada como guía" arrow>
            <EventNote fontSize="small" color="action" />
          </Tooltip>
          <ToggleButtonGroup
            exclusive
            value={cycleWeek}
            onChange={(_, val) => { if (val != null) setCycleWeek(val); }}
            size="small"
          >
            {CYCLE_WEEKS.map(w => (
              <ToggleButton key={w} value={w} sx={{ px: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}>
                Sem {w}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Log count */}
        <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
          {viewMode === 'day'
            ? `${dayLogCount} log${dayLogCount !== 1 ? 's' : ''} hoy`
            : `${logs.length} log${logs.length !== 1 ? 's' : ''} esta semana`
          }
        </Typography>
      </Box>

      {/* Loading skeleton */}
      {loading ? (
        viewMode === 'day' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 3].map(i => (
              <Paper key={i} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                <Skeleton width={200} height={24} />
                <Skeleton width={120} height={18} sx={{ mt: 0.5 }} />
                <Skeleton width="60%" height={32} sx={{ mt: 1.5 }} />
              </Paper>
            ))}
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Sitio</TableCell>
                  {DAY_LABELS.map(d => (
                    <TableCell key={d} align="center" sx={{ fontWeight: 700, minWidth: 100 }}>{d}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[1, 2, 3].map(i => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width={140} /></TableCell>
                    {DAY_LABELS.map((_, j) => (
                      <TableCell key={j} align="center"><Skeleton width={60} /></TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : viewMode === 'day' ? (
        /* ── Day view: card-based vertical list ── */
        dayRows.length === 0 ? (
          <Box sx={{ textAlign: 'center' }}>
            <EmptyState message="No hay sitios planificados ni logs registrados para este día" />
            <Button variant="outlined" startIcon={<Add />} onClick={openCustomModal} sx={{ mt: -4 }}>
              Registrar un log
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {dayRows.map(row => {
              const cellLogs = logsBySiteDay[`${row.site_id}_${selectedDayIdx}`] || [];
              const plannerItems = row.plannerByDay[selectedDayIdx] || [];
              const hasLogs = cellLogs.length > 0;

              return (
                <Paper
                  key={row.site_id}
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: hasLogs ? 'divider' : (theme) => alpha(theme.palette.text.disabled, 0.2),
                    borderRadius: 2,
                    p: 2,
                    ...(!hasLogs && {
                      bgcolor: (theme) => alpha(theme.palette.text.disabled, 0.04),
                      opacity: 0.7,
                    }),
                  }}
                >
                  {/* Card header */}
                  <Typography variant="body1" fontWeight={600} color={hasLogs ? 'text.primary' : 'text.secondary'}>
                    {row.site_name}
                  </Typography>
                  {row.suburb && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      {row.suburb}
                    </Typography>
                  )}

                  {/* Logged entries */}
                  {hasLogs && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                      {cellLogs.map(log => (
                        <Box
                          key={log.id}
                          sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                          onClick={() => openEditModal(log, row)}
                        >
                          <LogChip log={log} />
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Planner indicators (only if no logs) */}
                  {!hasLogs && plannerItems.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                      {plannerItems.map(item => (
                        <PlannedIndicator key={item.item_id} item={item} />
                      ))}
                    </Box>
                  )}

                  {/* Add log button */}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => openModal(row, selectedDayIdx, plannerItems)}
                    sx={{ textTransform: 'none' }}
                  >
                    Agregar log
                  </Button>
                </Paper>
              );
            })}

            {/* Add log for another site */}
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={openCustomModal}
                sx={{ textTransform: 'none', color: 'text.secondary' }}
              >
                Agregar log para otro sitio
              </Button>
            </Box>
          </Box>
        )
      ) : (
        /* ── Week view: original table ── */
        gridRows.length === 0 ? (
          <Box sx={{ textAlign: 'center' }}>
            <EmptyState message="No hay sitios planificados ni logs registrados para esta semana" />
            <Button variant="outlined" startIcon={<Add />} onClick={openCustomModal} sx={{ mt: -4 }}>
              Registrar un log
            </Button>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, minWidth: 200, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 2 }}>
                    Sitio
                  </TableCell>
                  {weekDates.map((date, i) => {
                    const isToday = i === todayIndex;
                    return (
                      <TableCell
                        key={i}
                        align="center"
                        sx={{
                          fontWeight: 700,
                          minWidth: 110,
                          ...(isToday && {
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                          }),
                        }}
                      >
                        <Typography variant="caption" display="block" fontWeight={700}>
                          {DAY_LABELS[i]}
                        </Typography>
                        <Typography variant="caption" color={isToday ? 'primary.main' : 'text.secondary'} fontWeight={isToday ? 700 : 400}>
                          {date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })}
                        </Typography>
                        {isToday && (
                          <Chip
                            label="HOY"
                            size="small"
                            color="primary"
                            sx={{ height: 16, fontSize: '0.55rem', fontWeight: 700, ml: 0.5, '& .MuiChip-label': { px: 0.5 } }}
                          />
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center" sx={{ fontWeight: 700, minWidth: 80 }}>
                    <Typography variant="caption" display="block" fontWeight={700}>Total</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {gridRows.map(row => (
                  <TableRow key={row.site_id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    {/* Site name column (sticky) */}
                    <TableCell sx={{ verticalAlign: 'top', py: 1.5, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{row.site_name}</Typography>
                      {row.suburb && (
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {row.suburb}
                        </Typography>
                      )}
                    </TableCell>

                    {/* Day cells */}
                    {weekDates.map((_, dayIdx) => {
                      const isToday = dayIdx === todayIndex;
                      const cellLogs = logsBySiteDay[`${row.site_id}_${dayIdx}`] || [];
                      const plannerItems = row.plannerByDay[dayIdx] || [];
                      const hasLogs = cellLogs.length > 0;
                      const hasPlanner = plannerItems.length > 0;

                      return (
                        <TableCell
                          key={dayIdx}
                          align="center"
                          onClick={() => openModal(row, dayIdx, plannerItems)}
                          sx={{
                            verticalAlign: 'top',
                            py: 1,
                            px: 0.75,
                            minWidth: 110,
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                            ...(isToday && {
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                            }),
                            '&:hover': {
                              bgcolor: (theme) => alpha(theme.palette.primary.main, isToday ? 0.10 : 0.06),
                            },
                          }}
                        >
                          {/* Logged entries — click to edit/delete */}
                          {cellLogs.map(log => (
                            <Box
                              key={log.id}
                              sx={{ mb: 0.5, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                              onClick={(e) => { e.stopPropagation(); openEditModal(log, row); }}
                            >
                              <LogChip log={log} />
                            </Box>
                          ))}

                          {/* Planner indicators (only if no matching log for that type) */}
                          {!hasLogs && hasPlanner && plannerItems.map(item => (
                            <Box key={item.item_id} sx={{ mb: 0.5 }}>
                              <PlannedIndicator item={item} />
                            </Box>
                          ))}

                          {/* Empty cell hint */}
                          {!hasLogs && !hasPlanner && (
                            <Add
                              sx={{
                                fontSize: 16,
                                color: 'text.disabled',
                                opacity: 0,
                                transition: 'opacity 0.15s',
                                '.MuiTableCell-root:hover &': { opacity: 1 },
                              }}
                            />
                          )}

                          {/* "Add more" hint when there are logs but user might want to add another type */}
                          {hasLogs && (
                            <Add
                              sx={{
                                fontSize: 14,
                                color: 'text.disabled',
                                opacity: 0,
                                mt: 0.25,
                                transition: 'opacity 0.15s',
                                '.MuiTableCell-root:hover &': { opacity: 0.6 },
                              }}
                            />
                          )}
                        </TableCell>
                      );
                    })}

                    {/* Row total */}
                    {(() => {
                      const rowTotal = Array.from({ length: 7 }, (_, d) =>
                        (logsBySiteDay[`${row.site_id}_${d}`] || []).reduce((s, l) => s + Number(l.display_value || 0), 0)
                      ).reduce((a, b) => a + b, 0);
                      return (
                        <TableCell align="center" sx={{ verticalAlign: 'top', py: 1.5 }}>
                          <Typography variant="body2" fontWeight={700} color={rowTotal > 0 ? 'primary.main' : 'text.disabled'}>
                            {rowTotal > 0 ? rowTotal.toFixed(2) : '—'}
                          </Typography>
                        </TableCell>
                      );
                    })()}
                  </TableRow>
                ))}

                {/* Week totals row */}
                {gridRows.length > 0 && (
                  <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) }}>
                    <TableCell sx={{ py: 1.5, position: 'sticky', left: 0, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04), zIndex: 1 }}>
                      <Typography variant="body2" fontWeight={700}>TOTAL</Typography>
                    </TableCell>
                    {weekDates.map((_, dayIdx) => {
                      const dayTotal = gridRows.reduce((sum, row) => {
                        const dayLogs = logsBySiteDay[`${row.site_id}_${dayIdx}`] || [];
                        return sum + dayLogs.reduce((s, l) => s + Number(l.display_value || 0), 0);
                      }, 0);
                      return (
                        <TableCell key={dayIdx} align="center" sx={{ py: 1.5 }}>
                          <Typography variant="body2" fontWeight={700} color={dayTotal > 0 ? 'primary.main' : 'text.disabled'}>
                            {dayTotal > 0 ? dayTotal.toFixed(2) : '—'}
                          </Typography>
                        </TableCell>
                      );
                    })}
                    {/* Grand total */}
                    {(() => {
                      const grandTotal = logs.reduce((s, l) => s + Number(l.display_value || 0), 0);
                      return (
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Typography variant="body2" fontWeight={800} color="primary.main">
                            {grandTotal > 0 ? grandTotal.toFixed(2) : '—'}
                          </Typography>
                        </TableCell>
                      );
                    })()}
                  </TableRow>
                )}

                {/* Add-site row */}
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align="center"
                    sx={{ py: 1.5, borderBottom: 0 }}
                  >
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={openCustomModal}
                      sx={{ textTransform: 'none', color: 'text.secondary' }}
                    >
                      Agregar log para otro sitio
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      {/* Import confirmation dialog */}
      <Dialog open={importDialogOpen} onClose={() => !importLoading && setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Importar logs de compañero</DialogTitle>
        <DialogContent>
          {importPreview && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Se copiarán los logs de <strong>{importPreview.source_user.nombre} {importPreview.source_user.apellido}</strong> del{' '}
                {new Date(importPreview.fecha_inicio + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} al{' '}
                {new Date(importPreview.fecha_fin + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}.
              </Typography>

              <Paper elevation={0} sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, mb: 2 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>Resumen:</Typography>
                <Typography variant="body2">
                  Total logs del compañero: <strong>{importPreview.summary.source_logs_total}</strong>
                </Typography>
                {importPreview.summary.create_count > 0 && (
                  <Typography variant="body2" color="success.main">
                    + {importPreview.summary.create_count} log{importPreview.summary.create_count !== 1 ? 's' : ''} nuevos a crear
                  </Typography>
                )}
                {importPreview.summary.update_count > 0 && (
                  <Typography variant="body2" color="info.main">
                    ~ {importPreview.summary.update_count} log{importPreview.summary.update_count !== 1 ? 's' : ''} que ya tienes
                  </Typography>
                )}
              </Paper>

              <Typography variant="caption" color="text.secondary">
                Después de importar podés editar cada log individualmente si algo es diferente.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setImportDialogOpen(false)}
            disabled={importLoading}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          {importPreview?.summary?.update_count > 0 && (
            <Button
              variant="outlined"
              onClick={() => handleImport(true)}
              disabled={importLoading}
              sx={{ textTransform: 'none' }}
            >
              {importLoading ? <CircularProgress size={20} /> : 'Importar y sobrescribir'}
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => handleImport(false)}
            disabled={importLoading}
            sx={{ textTransform: 'none' }}
          >
            {importLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : `Importar${importPreview?.summary?.update_count > 0 ? ' solo nuevos' : ''}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate report modal */}
      <GenerateLogReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        currentWeekStart={weekStart}
      />

      {/* Log form modal */}
      <LogFormModal
        key={modalKey}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        site={modalSite}
        fecha={modalFecha}
        plannerEntry={modalPlannerEntry}
        teamSites={teamSites}
        existingLog={modalExistingLog}
        onSaved={handleSaved}
      />
    </>
  );
}
