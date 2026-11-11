import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, Alert, Button, Tooltip, Skeleton,
  ToggleButton, ToggleButtonGroup, Chip, alpha, Fab, useMediaQuery, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  List, ListItemButton, ListItemText, Snackbar,
} from '@mui/material';
import {
  Add, ChevronLeft, ChevronRight, CalendarMonth, EventNote,
  ViewWeek, ViewDay, Sync, Assessment,
} from '@mui/icons-material';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LogFormModal from './LogFormModal';
import GenerateLogReportModal from './GenerateLogReportModal';
import { getMyLogs, importFromTeammate } from '../../services/logs.service';
import { getMyTeam, getWeekPlan, getTeamSites } from '../../services/planner.service';
import { getCycleWeek } from '../../utils/cycle';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [team, setTeam] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);
  // Manual override of the planner guide week; null = follow the displayed week automatically
  const [cycleOverride, setCycleOverride] = useState(null);
  // The 7-column week grid is hard to use on a phone, so default to the day cards there.
  const [viewMode, setViewMode] = useState(
    () => (window.matchMedia('(max-width: 899.95px)').matches ? 'day' : 'week'),
  ); // 'week' | 'day'
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

  // Teammate sync state (manual: the user triggers it with the "Sincronizar logs" button)
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null); // { severity, message }
  const [teammatePicker, setTeammatePicker] = useState(null); // teammates[] when the team has several

  // Monday of the current display week
  const weekStart = useMemo(() => getMonday(new Date(), weekOffset), [weekOffset]);

  // Planner cycle week (1-4) derived from the displayed week; the user can override it manually
  const autoCycleWeek = useMemo(() => getCycleWeek(weekStart), [weekStart]);
  const cycleWeek = cycleOverride ?? autoCycleWeek;

  // Moving to another week goes back to the automatic cycle week
  useEffect(() => { setCycleOverride(null); }, [weekStart]);

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

  /**
   * Copies the teammate's logs for the displayed week into the user's own logs.
   * Only creates missing logs — existing ones are never overwritten.
   * @param {number} [sourceUserId] - Required only when the team has several teammates.
   */
  const handleSync = async (sourceUserId) => {
    setSyncing(true);
    setTeammatePicker(null);
    setSyncResult(null);
    try {
      const result = await importFromTeammate({
        ...(sourceUserId ? { source_user_id: sourceUserId } : {}),
        fecha_inicio: formatDate(weekDates[0]),
        fecha_fin: formatDate(weekDates[6]),
        overwrite_existing: false,
        dry_run: false,
      });
      const { created = 0, skipped_existing = 0, source_logs_total = 0 } = result.summary || {};
      const mate = result.source_user ? result.source_user.nombre : 'tu compañero';

      if (created > 0) {
        setSyncResult({
          severity: 'success',
          message: `Se sincronizaron ${created} log${created !== 1 ? 's' : ''} de ${mate}`
            + (skipped_existing > 0 ? ` (${skipped_existing} ya los tenías)` : ''),
        });
        loadLogs();
      } else if (source_logs_total === 0) {
        setSyncResult({ severity: 'info', message: `${mate} aún no tiene logs en esta semana` });
      } else {
        setSyncResult({ severity: 'info', message: 'Ya estás al día: no hay logs nuevos para sincronizar' });
      }
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 400 && Array.isArray(data?.teammates)) {
        setTeammatePicker(data.teammates); // several teammates → ask which one
      } else {
        setSyncResult({ severity: 'error', message: data?.message || 'No se pudo sincronizar los logs' });
      }
    } finally {
      setSyncing(false);
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
          <Box sx={{ display: 'flex', gap: 1, '& > button': { flex: { xs: 1, sm: 'none' } } }}>
            <Button
              variant="outlined"
              startIcon={syncing ? <CircularProgress size={16} /> : <Sync />}
              onClick={() => handleSync()}
              disabled={syncing}
            >
              {syncing ? 'Sincronizando...' : 'Sincronizar logs'}
            </Button>
            <Button variant="outlined" startIcon={<Assessment />} onClick={() => setReportModalOpen(true)}>
              Generar reporte
            </Button>
            {/* On mobile the floating button below replaces this one */}
            {!isMobile && (
              <Button variant="contained" startIcon={<Add />} onClick={openCustomModal}>
                Agregar log
              </Button>
            )}
          </Box>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Controls bar */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
        {/* View mode toggle */}
        <ToggleButtonGroup
          exclusive
          value={viewMode}
          onChange={(_, val) => { if (val != null) setViewMode(val); }}
          size="small"
          sx={{ width: { xs: '100%', sm: 'auto' }, '& .MuiToggleButton-root': { flex: { xs: 1, sm: 'none' } } }}
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
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'space-between', sm: 'flex-start' },
          }}
        >
          <IconButton
            size="small"
            aria-label="Anterior"
            onClick={() => viewMode === 'day' ? setDayOffset(d => d - 1) : setWeekOffset(w => w - 1)}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, px: 1, flex: { xs: 1, sm: 'none' } }}>
            <CalendarMonth color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight={600} sx={{ minWidth: { xs: 90, sm: 140 }, textAlign: 'center', textTransform: 'capitalize' }}>
              {viewMode === 'day' ? dayLabel : weekLabel}
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label="Siguiente"
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
          <Tooltip title="Semana del planner usada como guía (• = la que corresponde a la fecha)" arrow>
            <EventNote fontSize="small" color="action" />
          </Tooltip>
          <ToggleButtonGroup
            exclusive
            value={cycleWeek}
            onChange={(_, val) => { if (val != null) setCycleOverride(val === autoCycleWeek ? null : val); }}
            size="small"
            sx={{ flex: { xs: 1, sm: 'none' }, '& .MuiToggleButton-root': { flex: { xs: 1, sm: 'none' } } }}
          >
            {CYCLE_WEEKS.map(w => (
              <ToggleButton key={w} value={w} sx={{ px: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}>
                Sem {w}{w === autoCycleWeek ? ' •' : ''}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* Log count */}
        <Typography variant="body2" color="text.secondary" sx={{ ml: { xs: 0, sm: 'auto' } }}>
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
                          sx={{ cursor: 'pointer', p: { xs: 0.5, md: 0 }, '&:hover': { opacity: 0.8 } }}
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
                    size={isMobile ? 'medium' : 'small'}
                    variant="outlined"
                    startIcon={<Add />}
                    fullWidth={isMobile}
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

      {/* Mobile quick-add: always reachable with the thumb */}
      {isMobile && (
        <Fab
          color="primary"
          variant="extended"
          aria-label="Agregar log"
          onClick={openCustomModal}
          sx={{
            position: 'fixed',
            right: 16,
            bottom: 'calc(16px + env(safe-area-inset-bottom))',
            zIndex: (t) => t.zIndex.speedDial,
            textTransform: 'none',
          }}
        >
          <Add sx={{ mr: 1 }} />
          Agregar log
        </Fab>
      )}

      {/* Teammate picker — only shown when the team has more than one teammate */}
      <Dialog open={!!teammatePicker} onClose={() => setTeammatePicker(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>¿De quién sincronizar?</DialogTitle>
        <DialogContent sx={{ px: 1 }}>
          <List>
            {(teammatePicker || []).map(m => (
              <ListItemButton key={m.id} onClick={() => handleSync(m.id)}>
                <ListItemText primary={`${m.nombre} ${m.apellido || ''}`.trim()} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeammatePicker(null)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Sync result */}
      <Snackbar
        open={!!syncResult}
        autoHideDuration={6000}
        onClose={(_, reason) => { if (reason !== 'clickaway') setSyncResult(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 'calc(88px + env(safe-area-inset-bottom))', md: 24 } }}
      >
        {syncResult ? (
          <Alert severity={syncResult.severity} variant="filled" onClose={() => setSyncResult(null)} sx={{ width: '100%' }}>
            {syncResult.message}
          </Alert>
        ) : undefined}
      </Snackbar>

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
