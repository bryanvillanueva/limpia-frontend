import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, IconButton, Alert, Button, Tooltip, Skeleton,
  ToggleButton, ToggleButtonGroup, alpha, Fab, useMediaQuery, useTheme,
  Snackbar, LinearProgress,
} from '@mui/material';
import {
  Add, ChevronLeft, ChevronRight, CalendarMonth, EventNote,
  ViewWeek, ViewDay, Share, Assessment,
} from '@mui/icons-material';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import LogFormModal from './LogFormModal';
import GenerateLogReportModal from './GenerateLogReportModal';
import { getMyLogs } from '../../services/logs.service';
import ShareLogsDialog from './ShareLogsDialog';
import { LOGS_CHANGED_EVENT } from '../../components/layout/NotificationBell';
import { getMyTeam, getWeekPlan, getTeamSites } from '../../services/planner.service';
import { getCycleWeek } from '../../utils/cycle';
import NoTeamState from '../../components/ui/NoTeamState';
import { isNoTeamError } from '../../utils/team';
import { EntryCard, AddInCell, LogLegend, WeekSummary } from './LogGridParts';
import { cellEntries, hoursLabel } from './logGrid';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const CYCLE_WEEKS = [1, 2, 3, 4];

// Site column stays put while the week scrolls sideways; the shadow covers the 6px gaps between tiles
const stickySx = {
  position: 'sticky',
  left: 0,
  zIndex: 2,
  bgcolor: 'background.paper',
  boxShadow: (t) => `-6px 0 0 ${t.palette.background.paper}, 6px 0 0 ${t.palette.background.paper}`,
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

export default function MisSitiosPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [team, setTeam] = useState(null);
  const [noTeam, setNoTeam] = useState(false); // the cleaner is not in a team yet (not an error)
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
  const [loading, setLoading] = useState(true); // first load / week change: shows the skeleton
  const [refreshing, setRefreshing] = useState(false); // background reload: table stays visible
  const [flashIds, setFlashIds] = useState(() => new Set());
  const loadSeq = useRef(0); // ignores responses of outdated requests
  const knownLogs = useRef(new Map()); // log id -> signature, to detect new/edited logs
  const flashTimer = useRef(null);
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

  // Sharing logs with another cleaner (they get a notification and decide whether to accept)
  const [shareOpen, setShareOpen] = useState(false);
  const [notice, setNotice] = useState(null); // { severity, message }

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
      .catch((err) => {
        if (isNoTeamError(err)) setNoTeam(true);
        else setError('Error al detectar tu equipo');
      });
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

  /**
   * Loads the logs of the displayed week.
   * @param {{silent?: boolean}} [options] - silent: keep the table on screen (no skeleton, scroll untouched)
   *   and highlight logs that are new or changed. Used after saving, editing, deleting or accepting a share.
   */
  const loadLogs = useCallback(async ({ silent = false } = {}) => {
    const seq = ++loadSeq.current;
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const allLogs = await getMyLogs();
      if (seq !== loadSeq.current) return; // a newer request took over
      const startStr = formatDate(weekDates[0]);
      const endStr = formatDate(weekDates[6]);
      const weekLogs = (Array.isArray(allLogs) ? allLogs : []).filter(l => {
        const f = l.fecha?.slice(0, 10);
        return f >= startStr && f <= endStr;
      });

      const signature = (l) => `${l.entry_type}|${l.display_value}|${l.observaciones || ''}|${l.fecha}`;
      if (silent) {
        const changed = weekLogs.filter(l => knownLogs.current.get(l.id) !== signature(l)).map(l => l.id);
        if (changed.length > 0) {
          setFlashIds(new Set(changed));
          clearTimeout(flashTimer.current);
          flashTimer.current = setTimeout(() => setFlashIds(new Set()), 2500);
        }
      }
      knownLogs.current = new Map(weekLogs.map(l => [l.id, signature(l)]));
      setLogs(weekLogs);
    } catch {
      if (seq === loadSeq.current) setError('Error al cargar tus registros');
    } finally {
      if (seq === loadSeq.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [weekDates]);

  useEffect(() => { loadLogs(); }, [loadLogs]);
  useEffect(() => () => clearTimeout(flashTimer.current), []);

  // Reload when logs change outside this page (e.g. accepting a shared week from the notifications bell)
  useEffect(() => {
    const onChanged = () => loadLogs({ silent: true });
    window.addEventListener(LOGS_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(LOGS_CHANGED_EVENT, onChanged);
  }, [loadLogs]);

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

  // Entries (planned + registered, merged) of one cell
  const entriesFor = useCallback(
    (row, dayIdx) => cellEntries(row.plannerByDay[dayIdx] || [], logsBySiteDay[`${row.site_id}_${dayIdx}`] || []),
    [logsBySiteDay],
  );

  // Operational summary of the displayed week
  const weekSummary = useMemo(() => {
    let planned = 0;
    let pending = 0;
    for (const row of gridRows) {
      for (let d = 0; d < 7; d++) {
        planned += (row.plannerByDay[d] || []).length;
        pending += entriesFor(row, d).filter(e => e.state === 'planned').length;
      }
    }
    const hours = logs.reduce((s, l) => s + Number(l.display_value || 0), 0);
    return [
      { label: gridRows.length === 1 ? 'sitio' : 'sitios', value: gridRows.length },
      { label: planned === 1 ? 'servicio planificado' : 'servicios planificados', value: planned },
      { label: pending === 1 ? 'pendiente de registrar' : 'pendientes de registrar', value: pending, tone: pending > 0 ? 'warning' : undefined },
      { label: logs.length === 1 ? 'log registrado' : 'logs registrados', value: logs.length, tone: 'success' },
      { label: 'registradas', value: hoursLabel(hours) },
    ];
  }, [gridRows, entriesFor, logs]);

  // "lunes 9 nov." — used in accessible names and tooltips
  const dayName = (dayIdx) => weekDates[dayIdx].toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' });

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
    loadLogs({ silent: true });
  };

  const isCurrentWeek = weekOffset === 0;

  // Without a team there is nothing to register: explain it instead of showing an error
  if (noTeam) {
    return (
      <>
        <PageHeader title="Registrar Logs" subtitle="Sin equipo asignado" />
        <NoTeamState />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Registrar Logs"
        subtitle={team ? `Equipo ${team.team_numero ?? team.team_id}` : 'Cargando equipo...'}
        action={
          <Box sx={{ display: 'flex', gap: 1, '& > button': { flex: { xs: 1, sm: 'none' } } }}>
            {/* Only offered once there is something to share */}
            {logs.length > 0 && (
              <Button variant="outlined" startIcon={<Share />} onClick={() => setShareOpen(true)}>
                Compartir logs
              </Button>
            )}
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

        {/* Log count of the selected day (the week has its own summary below) */}
        {viewMode === 'day' && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: { xs: 0, sm: 'auto' } }}>
            {`${dayLogCount} log${dayLogCount !== 1 ? 's' : ''} este día`}
          </Typography>
        )}
      </Box>

      {/* Week summary + legend: what is left to do, without scanning the grid */}
      {viewMode === 'week' && !loading && gridRows.length > 0 && (
        <Box
          sx={{
            display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: { xs: 'flex-start', lg: 'center' },
            justifyContent: 'space-between', gap: 1.5, mb: 1.5,
          }}
        >
          <WeekSummary items={weekSummary} />
          <LogLegend />
        </Box>
      )}

      {/* Background refresh indicator — fixed height so the layout never shifts */}
      <Box sx={{ height: 3, mb: 1, borderRadius: 1, overflow: 'hidden' }}>
        {refreshing && <LinearProgress sx={{ height: 3 }} />}
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
              const entries = entriesFor(row, selectedDayIdx);
              const pending = entries.filter(e => e.state === 'planned').map(e => e.item);
              const hasLogged = entries.some(e => e.state === 'logged');

              return (
                <Paper
                  key={row.site_id}
                  elevation={0}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  {/* Card header */}
                  <Typography variant="body1" fontWeight={600}>
                    {row.site_name}
                  </Typography>
                  {row.suburb && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      {row.suburb}
                    </Typography>
                  )}

                  {/* Same card for planned and registered services: tap a registered one to edit it,
                      a planned one to register it */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1, mb: hasLogged ? 0 : 1.5 }}>
                    {entries.map(entry => (
                      <EntryCard
                        key={entry.key}
                        entry={entry}
                        siteName={row.site_name}
                        dayName={dayName(selectedDayIdx)}
                        flash={entry.state === 'logged' && flashIds.has(entry.log.id)}
                        onClick={() => (entry.state === 'logged'
                          ? openEditModal(entry.log, row)
                          : openModal(row, selectedDayIdx, [entry.item]))}
                      />
                    ))}
                  </Box>

                  {/* Add a log for this site and day — hidden once something is registered */}
                  {!hasLogged && (
                    <Button
                      size={isMobile ? 'medium' : 'small'}
                      variant="text"
                      startIcon={<Add />}
                      fullWidth={isMobile}
                      onClick={() => openModal(row, selectedDayIdx, pending)}
                      aria-label={`Agregar log, ${row.site_name}, ${dayName(selectedDayIdx)}`}
                      sx={{ textTransform: 'none' }}
                    >
                      Agregar log
                    </Button>
                  )}
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
        /* ── Week view: one tile per site and day ── */
        gridRows.length === 0 ? (
          <Box sx={{ textAlign: 'center' }}>
            <EmptyState message="No hay sitios planificados ni logs registrados para esta semana" />
            <Button variant="outlined" startIcon={<Add />} onClick={openCustomModal} sx={{ mt: -4 }}>
              Registrar un log
            </Button>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto', px: 0.5, pb: 0.5 }}
          >
            <Table
              size="small"
              sx={{
                minWidth: 1440,
                borderCollapse: 'separate',
                borderSpacing: '6px',
                '& td, & th': { borderBottom: 'none' },
              }}
            >
              <TableHead sx={{ bgcolor: 'transparent', '& .MuiTableCell-head': { borderBottom: 'none' } }}>
                <TableRow>
                  <TableCell sx={{ ...stickySx, minWidth: 170, verticalAlign: 'bottom', pb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>Sitio</Typography>
                  </TableCell>
                  {weekDates.map((date, i) => {
                    const isToday = i === todayIndex;
                    return (
                      <TableCell key={i} align="center" sx={{ p: 0, minWidth: 164, verticalAlign: 'bottom' }}>
                        <Box
                          sx={{
                            borderRadius: '8px',
                            py: 0.75,
                            ...(isToday && { bgcolor: (t) => alpha(t.palette.primary.main, 0.1) }),
                          }}
                        >
                          <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'uppercase', color: (th) => (isToday ? th.palette.primary[th.palette.mode === 'dark' ? 'light' : 'main'] : th.palette.text.primary) }}>
                            {DAY_LABELS[i]} {date.getDate()}
                          </Typography>
                          {isToday && (
                            <Typography component="div" sx={{ fontSize: '0.65rem', fontWeight: 700, lineHeight: 1.2, color: (th) => th.palette.primary[th.palette.mode === 'dark' ? 'light' : 'main'] }}>
                              HOY
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                    );
                  })}
                  <TableCell align="center" sx={{ minWidth: 72, verticalAlign: 'bottom', pb: 1 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>Total</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {gridRows.map(row => {
                  const rowTotal = Array.from({ length: 7 }, (_, d) =>
                    (logsBySiteDay[`${row.site_id}_${d}`] || []).reduce((s, l) => s + Number(l.display_value || 0), 0),
                  ).reduce((a, b) => a + b, 0);

                  return (
                    <TableRow key={row.site_id}>
                      {/* Site (stays visible while scrolling sideways) */}
                      <TableCell sx={{ ...stickySx, py: 1 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.3 }}>{row.site_name}</Typography>
                        {row.suburb && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
                            {row.suburb}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Day tiles */}
                      {weekDates.map((_, dayIdx) => {
                        const isToday = dayIdx === todayIndex;
                        const entries = entriesFor(row, dayIdx);
                        const pending = entries.filter(e => e.state === 'planned').map(e => e.item);
                        const day = dayName(dayIdx);
                        const add = () => openModal(row, dayIdx, pending);

                        return (
                          <TableCell key={dayIdx} sx={{ p: 0, verticalAlign: 'top', height: '1px' /* lets the tile fill the row */ }}>
                            <Box
                              sx={{
                                height: '100%',
                                minHeight: 64,
                                p: 0.5,
                                borderRadius: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0.5,
                                bgcolor: (t) => (isToday
                                  ? alpha(t.palette.primary.main, 0.05)
                                  : alpha(t.palette.text.primary, t.palette.mode === 'dark' ? 0.05 : 0.035)),
                              }}
                            >
                              {/* Empty cell: one big add target. With cards, each card is the action
                                  (planned -> register, registered -> edit), so there is no separate add button. */}
                              {entries.length === 0 ? (
                                <AddInCell siteName={row.site_name} dayName={day} onClick={add} />
                              ) : (
                                <>
                                  {entries.map(entry => (
                                    <EntryCard
                                      key={entry.key}
                                      entry={entry}
                                      siteName={row.site_name}
                                      dayName={day}
                                      flash={entry.state === 'logged' && flashIds.has(entry.log.id)}
                                      onClick={() => (entry.state === 'logged'
                                        ? openEditModal(entry.log, row)
                                        : openModal(row, dayIdx, [entry.item]))}
                                    />
                                  ))}
                                </>
                              )}
                            </Box>
                          </TableCell>
                        );
                      })}

                      {/* Row total */}
                      <TableCell align="center" sx={{ verticalAlign: 'middle' }}>
                        <Typography variant="body2" fontWeight={700} color={rowTotal > 0 ? 'primary.main' : 'text.disabled'}>
                          {rowTotal > 0 ? hoursLabel(rowTotal) : '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* Week totals */}
                <TableRow>
                  <TableCell sx={{ ...stickySx, py: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={700}>Total</Typography>
                  </TableCell>
                  {weekDates.map((_, dayIdx) => {
                    const dayTotal = gridRows.reduce((sum, row) => {
                      const dayLogs = logsBySiteDay[`${row.site_id}_${dayIdx}`] || [];
                      return sum + dayLogs.reduce((s, l) => s + Number(l.display_value || 0), 0);
                    }, 0);
                    return (
                      <TableCell key={dayIdx} align="center" sx={{ py: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="body2" fontWeight={700} color={dayTotal > 0 ? 'primary.main' : 'text.disabled'}>
                          {dayTotal > 0 ? hoursLabel(dayTotal) : '—'}
                        </Typography>
                      </TableCell>
                    );
                  })}
                  <TableCell align="center" sx={{ py: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" fontWeight={800} color="primary.main">
                      {logs.length > 0 ? hoursLabel(logs.reduce((s, l) => s + Number(l.display_value || 0), 0)) : '—'}
                    </Typography>
                  </TableCell>
                </TableRow>

                {/* Add-site row */}
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 1 }}>
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

      {/* Share logs with a teammate or anyone else */}
      <ShareLogsDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        fechaInicio={formatDate(weekDates[0])}
        fechaFin={formatDate(weekDates[6])}
        weekLabel={weekLabel}
        logCount={logs.length}
        onSent={(message) => setNotice({ severity: 'success', message })}
      />

      {/* Feedback */}
      <Snackbar
        open={!!notice}
        autoHideDuration={6000}
        onClose={(_, reason) => { if (reason !== 'clickaway') setNotice(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 'calc(88px + env(safe-area-inset-bottom))', md: 24 } }}
      >
        {notice ? (
          <Alert severity={notice.severity} variant="filled" onClose={() => setNotice(null)} sx={{ width: '100%' }}>
            {notice.message}
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
