import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, alpha, Skeleton, Chip, ButtonBase, Button, Alert,
} from '@mui/material';
import {
  People, Groups, LocationOn, Inventory,
  ShoppingCart, BeachAccess, BarChart, Warning,
  AccessTime, CalendarMonth, Assignment, EditNote,
  CheckCircle, HourglassEmpty, ChevronRight, Undo, Description, TaskAlt, Refresh, Loop,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/dashboard.service';
import StatCard from '../../components/ui/StatCard';
import SectionTitle from '../../components/ui/SectionTitle';
import { getCycleWeek } from '../../utils/cycle';
import { formatHours } from '../../utils/format';
import { getMyProfile } from '../../services/auth.service';
import { applySavedOrder, moveItem } from './route';

const ROUTE_ORDER_KEY = 'limpia_route_order';
import TodayRoute from './TodayRoute';
import { heroGradient } from '../../theme/hero';

const ROLE_LABELS = {
  admin: 'Administrador',
  manager: 'Manager',
  accountant: 'Contador',
  cleaner: 'Limpiador',
};

/** The one thing each role most often comes to do, offered right in the header. */
const PRIMARY_ACTION = {
  admin:      { label: 'Ver reportes',    path: '/reportes',       icon: <BarChart /> },
  manager:    { label: 'Ver equipos',     path: '/equipos',        icon: <Groups /> },
  accountant: { label: 'Ver reportes',    path: '/reportes',       icon: <BarChart /> },
  // cleaner: the "Hoy" card already leads with "Registrar logs"
};

const QUICK_LINKS = {
  admin: [
    { label: 'Usuarios',     icon: <People />,        path: '/usuarios' },
    { label: 'Equipos',      icon: <Groups />,        path: '/equipos' },
    { label: 'Sitios',       icon: <LocationOn />,    path: '/sitios' },
    { label: 'Planner',      icon: <CalendarMonth />, path: '/planner' },
    { label: 'Supplies',     icon: <Inventory />,     path: '/supplies' },
    { label: 'Pedidos',      icon: <ShoppingCart />,  path: '/pedidos' },
    { label: 'Vacaciones',   icon: <BeachAccess />,   path: '/vacaciones' },
    { label: 'Quejas',       icon: <Warning />,       path: '/quejas' },
  ],
  manager: [
    { label: 'Equipos',      icon: <Groups />,        path: '/equipos' },
    { label: 'Sitios',       icon: <LocationOn />,    path: '/sitios' },
    { label: 'Planner',      icon: <CalendarMonth />, path: '/planner' },
    { label: 'Supplies',     icon: <Inventory />,     path: '/supplies' },
    { label: 'Pedidos',      icon: <ShoppingCart />,  path: '/pedidos' },
    { label: 'Vacaciones',   icon: <BeachAccess />,   path: '/vacaciones' },
  ],
  accountant: [
    { label: 'Sitios',       icon: <LocationOn />,    path: '/sitios' },
    { label: 'Pedidos',      icon: <ShoppingCart />,  path: '/pedidos' },
    { label: 'Planner',      icon: <CalendarMonth />, path: '/planner' },
    { label: 'Clientes',     icon: <People />,        path: '/clientes' },
  ],
  cleaner: [
    { label: 'Mis Sitios',     icon: <LocationOn />,    path: '/mis-sitios' },
    { label: 'Mis Reportes',   icon: <Assignment />,    path: '/mis-reportes' },
    { label: 'Mis Pedidos',    icon: <ShoppingCart />,  path: '/mis-pedidos' },
    { label: 'Mis Vacaciones', icon: <BeachAccess />,   path: '/mis-vacaciones' },
  ],
};

const CARD = { xs: 6, md: 3 };

// MainLayout's <main> padding; the banner cancels it to reach the edges
const PAGE_GUTTER = { xs: 1.5, sm: 2, md: 3 };
const PAGE_GUTTER_NEG = { xs: -1.5, sm: -2, md: -3 };

/* ─── Header: who, when, and the main action ─── */
function DashboardHeader({ user, onAction }) {
  const action = PRIMARY_ACTION[user?.rol];
  const today = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayLabel = today.charAt(0).toUpperCase() + today.slice(1);
  const firstName = (user?.nombre || '').split(' ')[0];

  const pill = (icon, text) => (
    <Box
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.25, py: 0.5, borderRadius: '8px',
        bgcolor: 'rgba(255,255,255,0.14)', fontSize: '0.8125rem', fontWeight: 500,
      }}
    >
      {icon}{text}
    </Box>
  );

  return (
    // Continues the green top bar: flush with it and with the page edges (cancels the main padding),
    // rounded only at the bottom, so bar + banner read as one header.
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        mx: PAGE_GUTTER_NEG,
        mt: PAGE_GUTTER_NEG,
        px: PAGE_GUTTER,
        pt: { xs: 1.5, md: 2 },
        pb: { xs: 3, md: 3.5 },
        mb: 3,
        borderRadius: '0 0 20px 20px',
        border: 'none',
        color: 'primary.contrastText',
        background: heroGradient,
      }}
    >
      <Box
        sx={{
          position: 'relative', zIndex: 1, display: 'flex', gap: 2, maxWidth: 1280, mx: 'auto',
          flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>{getGreeting()},</Typography>
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.875rem' }, fontWeight: 800, lineHeight: 1.2 }}>
            {firstName || user?.nombre}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
            {pill(<CalendarMonth sx={{ fontSize: 16 }} />, todayLabel)}
            {pill(<Loop sx={{ fontSize: 16 }} />, `Semana ${getCycleWeek()} del ciclo`)}
            {pill(null, ROLE_LABELS[user?.rol] || user?.rol)}
          </Box>
        </Box>
        {action && (
          <Button
            variant="contained"
            startIcon={action.icon}
            onClick={() => onAction(action.path)}
            sx={{
              flexShrink: 0, px: 2.5, py: 1.1, borderRadius: '10px',
              bgcolor: 'common.white', color: 'primary.dark', boxShadow: 'none',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.88)', boxShadow: 'none' },
            }}
          >
            {action.label}
          </Button>
        )}
      </Box>
    </Paper>
  );
}

/* ─── Section heading with an optional status on the right ─── */
function Section({ title, status, children, sx }) {
  return (
    <Box component="section" sx={{ mb: 3.5, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5 }}>
        <SectionTitle sx={{ mb: 0 }}>{title}</SectionTitle>
        {status}
      </Box>
      {children}
    </Box>
  );
}

const AllClear = () => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'success.main', fontSize: '0.8125rem', fontWeight: 600 }}>
    <TaskAlt sx={{ fontSize: 18 }} /> Todo al día
  </Box>
);

/**
 * Things someone has to act on. Items with something pending are tinted with their tone;
 * at zero they stay neutral, and the section says "Todo al día".
 */
function AttentionSection({ items, navigate }) {
  const pending = items.reduce((s, i) => s + (Number(i.value) || 0), 0);
  return (
    <Section title="Requiere atención" status={pending === 0 ? <AllClear /> : null}>
      <Grid container spacing={2}>
        {items.map((i) => {
          const active = (Number(i.value) || 0) > 0;
          return (
            <Grid size={CARD} key={i.label}>
              <StatCard
                icon={i.icon}
                label={i.label}
                value={i.value}
                tone={active ? i.tone : 'secondary'}
                highlight={active}
                onClick={i.path ? () => navigate(i.path) : undefined}
              />
            </Grid>
          );
        })}
      </Grid>
    </Section>
  );
}

/* ─── Skeleton while loading ─── */
function StatsSkeleton({ count = 4 }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3.5 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid size={CARD} key={i}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: '12px' }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width={50} height={30} />
                <Skeleton width="80%" height={16} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

/* ─── Admin ─── */
function AdminStats({ stats, navigate }) {
  const t = stats.totals || {};
  return (
    <>
      <AttentionSection
        navigate={navigate}
        items={[
          { label: 'Reportes por revisar', value: stats.reports_by_status?.Enviado || 0, tone: 'warning', icon: <BarChart />, path: '/reportes' },
          { label: 'Pedidos pendientes', value: stats.orders_by_status?.pending || 0, tone: 'warning', icon: <ShoppingCart />, path: '/pedidos' },
          { label: 'Vacaciones por aprobar', value: stats.pending_vacations ?? 0, tone: 'info', icon: <BeachAccess />, path: '/vacaciones' },
          { label: 'Quejas abiertas', value: stats.open_complaints ?? 0, tone: 'error', icon: <Warning />, path: '/quejas' },
        ]}
      />
      <Section title="Resumen">
        <Grid container spacing={2}>
          <Grid size={CARD}><StatCard icon={<AccessTime />} label="Horas esta semana" value={formatHours(stats.hours_this_week)} /></Grid>
          <Grid size={CARD}><StatCard icon={<LocationOn />} label="Sitios activos" value={t.active_sites ?? 0} subtitle={t.sites ? `de ${t.sites} en total` : null} onClick={() => navigate('/sitios')} /></Grid>
          <Grid size={CARD}><StatCard icon={<Groups />} label="Equipos" value={t.teams ?? 0} onClick={() => navigate('/equipos')} /></Grid>
          <Grid size={CARD}><StatCard icon={<People />} label="Usuarios" value={t.users ?? 0} onClick={() => navigate('/usuarios')} /></Grid>
        </Grid>
      </Section>
    </>
  );
}

/* ─── Manager ─── */
function ManagerStats({ stats, navigate }) {
  return (
    <>
      <AttentionSection
        navigate={navigate}
        items={[
          { label: 'Pedidos pendientes', value: stats.pending_orders ?? 0, tone: 'warning', icon: <ShoppingCart />, path: '/pedidos' },
          { label: 'Vacaciones por aprobar', value: stats.pending_vacations ?? 0, tone: 'info', icon: <BeachAccess />, path: '/vacaciones' },
        ]}
      />
      <Section title="Tus equipos esta semana">
        <Grid container spacing={2}>
          <Grid size={CARD}><StatCard icon={<AccessTime />} label="Horas registradas" value={formatHours(stats.hours_this_week)} /></Grid>
          <Grid size={CARD}><StatCard icon={<Description />} label="Logs registrados" value={stats.logs_this_week ?? 0} /></Grid>
          <Grid size={CARD}><StatCard icon={<LocationOn />} label="Sitios asignados" value={stats.team_sites_count ?? 0} onClick={() => navigate('/sitios')} /></Grid>
          <Grid size={CARD}>
            <StatCard
              icon={<Groups />}
              label={(stats.my_teams_count ?? 0) === 1 ? 'Equipo' : 'Equipos'}
              value={stats.my_teams_count ?? 0}
              subtitle={`${stats.team_members_count ?? 0} miembros`}
              onClick={() => navigate('/equipos')}
            />
          </Grid>
        </Grid>
      </Section>
    </>
  );
}

/* ─── Accountant ─── */
function AccountantStats({ stats, navigate }) {
  const reports = stats.reports_by_status || {};
  return (
    <>
      <AttentionSection
        navigate={navigate}
        items={[
          { label: 'Reportes por revisar', value: reports.Enviado ?? 0, tone: 'warning', icon: <HourglassEmpty />, path: '/reportes' },
          { label: 'Pedidos pendientes', value: stats.orders_pending_count ?? 0, tone: 'warning', icon: <ShoppingCart />, path: '/pedidos' },
        ]}
      />
      <Section title="Reportes">
        <Grid container spacing={2}>
          <Grid size={CARD}><StatCard icon={<CheckCircle />} label="Pagados" value={reports.Pagado ?? 0} tone="success" onClick={() => navigate('/reportes')} /></Grid>
          <Grid size={CARD}><StatCard icon={<Undo />} label="Devueltos" value={reports.Devuelto ?? 0} tone="error" onClick={() => navigate('/reportes')} /></Grid>
          <Grid size={CARD}><StatCard icon={<AccessTime />} label="Horas del período" value={formatHours(stats.hours_this_period)} subtitle="Semanas 1+2 o 3+4 en curso" /></Grid>
          <Grid size={CARD}>
            <StatCard
              icon={<LocationOn />}
              label="Sitios activos"
              value={stats.active_sites ?? 0}
              subtitle={stats.total_sites ? `de ${stats.total_sites} en total` : null}
              onClick={() => navigate('/sitios')}
            />
          </Grid>
        </Grid>
      </Section>
    </>
  );
}

/* ─── Cleaner ─── */
function CleanerStats({ stats, navigate }) {
  const plannerSites = useMemo(() => stats.sites_today || [], [stats.sites_today]);

  // Visiting order: the planner's, unless the user reordered today's stops (saved for today only)
  const todayKey = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, local
  const [savedOrder, setSavedOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ROUTE_ORDER_KEY)); } catch { return null; }
  });
  const sitesToday = useMemo(() => applySavedOrder(plannerSites, savedOrder, todayKey), [plannerSites, savedOrder, todayKey]);
  const customOrder = sitesToday !== plannerSites;
  const persistOrder = (value) => {
    setSavedOrder(value);
    try {
      if (value) localStorage.setItem(ROUTE_ORDER_KEY, JSON.stringify(value));
      else localStorage.removeItem(ROUTE_ORDER_KEY);
    } catch { /* storage unavailable */ }
  };
  const moveStop = (from, to) => {
    const ids = moveItem(sitesToday, from, to).map((s) => s.site_id);
    const plannerIds = plannerSites.map((s) => s.site_id);
    persistOrder(ids.every((id, i) => id === plannerIds[i]) ? null : { date: todayKey, ids });
  };

  const hoursToday = sitesToday.reduce((s, x) => s + (Number(x.horas) || 0), 0);

  // Home address from the profile: the default start of today's route
  const [homeAddress, setHomeAddress] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((p) => { if (!cancelled) setHomeAddress(p?.direccion?.trim() || null); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setProfileLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  return (
    <Grid container spacing={2} sx={{ mb: 3.5 }}>
      {/* Today: what to do and the shortcut to register it. Numbers match the pins on the map. */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, pt: 2, pb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>Hoy</Typography>
            <Chip
              size="small"
              label={sitesToday.length === 1 ? '1 sitio' : `${sitesToday.length} sitios`}
              sx={{ fontWeight: 600, bgcolor: (t) => alpha(t.palette.primary.main, 0.12), color: (t) => t.palette.primary[t.palette.mode === 'dark' ? 'light' : 'main'] }}
            />
            {hoursToday > 0 && <Chip size="small" variant="outlined" label={formatHours(hoursToday)} sx={{ fontWeight: 600 }} />}
          </Box>

          {sitesToday.length > 0 ? (
            <Box component="ol" sx={{ flex: 1, px: 1, m: 0, listStyle: 'none' }}>
              {sitesToday.map((site, i) => (
                <Box component="li" key={site.site_id}>
                  <ButtonBase
                    onClick={() => navigate('/registrar-logs')}
                    aria-label={`Parada ${i + 1}: registrar log en ${site.nombre}`}
                    sx={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.25,
                      borderRadius: '10px', textAlign: 'left',
                      '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.05) },
                    }}
                  >
                    <Box
                      sx={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: '0.8125rem', fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1, minWidth: 0 }}>{site.nombre}</Typography>
                    {site.horas ? (
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{formatHours(site.horas)}</Typography>
                    ) : null}
                    <ChevronRight fontSize="small" sx={{ color: 'text.disabled' }} />
                  </ButtonBase>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2, color: 'text.secondary' }}>
              <TaskAlt sx={{ color: 'success.main' }} />
              <Typography variant="body2">No tienes sitios planificados para hoy.</Typography>
            </Box>
          )}

          <Box sx={{ px: 2.5, pb: 2, pt: 1 }}>
            <Button fullWidth variant="contained" startIcon={<EditNote />} onClick={() => navigate('/registrar-logs')}>
              Registrar logs
            </Button>
          </Box>
        </Paper>
      </Grid>

      {/* Route through today's sites */}
      <Grid size={{ xs: 12, md: 7 }}>
        {profileLoaded ? (
          <TodayRoute
            sites={sitesToday}
            homeAddress={homeAddress}
            onMove={moveStop}
            customOrder={customOrder}
            onResetOrder={() => persistOrder(null)}
          />
        ) : (
          <Skeleton variant="rounded" height={420} sx={{ borderRadius: '14px' }} />
        )}
      </Grid>
    </Grid>
  );
}

/* ─── Quick link tile ─── */
function QuickLink({ link, onClick }) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%', display: 'flex', justifyContent: 'flex-start', gap: 1.25, p: 1.25, textAlign: 'left',
        borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        '&:hover': { borderColor: 'primary.main', bgcolor: (t) => alpha(t.palette.primary.main, 0.03) },
        '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
      }}
    >
      <Box
        sx={{
          width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: (t) => alpha(t.palette.primary.main, 0.1), color: 'primary.main',
          '& svg': { fontSize: 20 },
        }}
      >
        {link.icon}
      </Box>
      <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1, minWidth: 0 }}>{link.label}</Typography>
      <ChevronRight fontSize="small" sx={{ color: 'text.disabled', flexShrink: 0 }} />
    </ButtonBase>
  );
}

/* ─── Page ─── */
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const data = await getDashboardStats();
      setStats(data.stats);
    } catch {
      setFailed(true); // the page still works: header and quick links stay usable
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const links = QUICK_LINKS[user?.rol] || [];
  const StatsComponent = {
    admin: AdminStats,
    manager: ManagerStats,
    accountant: AccountantStats,
    cleaner: CleanerStats,
  }[user?.rol];

  return (
    <Box>
      <DashboardHeader user={user} onAction={navigate} />

      <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
        {loading ? (
          <StatsSkeleton count={user?.rol === 'admin' ? 8 : user?.rol === 'cleaner' ? 4 : 6} />
        ) : failed ? (
          <Alert
            severity="warning"
            sx={{ mb: 3.5 }}
            action={<Button color="inherit" size="small" startIcon={<Refresh />} onClick={load}>Reintentar</Button>}
          >
            No pudimos cargar las estadísticas.
          </Alert>
        ) : (
          stats && StatsComponent && <StatsComponent stats={stats} navigate={navigate} />
        )}

        {links.length > 0 && (
          <Section title="Accesos rápidos" sx={{ mb: 0 }}>
            <Grid container spacing={1.5}>
              {links.map((link) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={link.path}>
                  <QuickLink link={link} onClick={() => navigate(link.path)} />
                </Grid>
              ))}
            </Grid>
          </Section>
        )}
      </Box>
    </Box>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}
