import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, alpha, Skeleton, Chip, ButtonBase,
} from '@mui/material';
import {
  People, Groups, LocationOn, Inventory,
  ShoppingCart, BeachAccess, BarChart, Warning,
  Dashboard, AccessTime, CalendarMonth, Assignment,
  CheckCircle, HourglassEmpty, ChevronRight,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/dashboard.service';
import StatCard from '../../components/ui/StatCard';
import SectionTitle from '../../components/ui/SectionTitle';

const ROLE_LABELS = {
  admin: 'Administrador',
  manager: 'Manager',
  accountant: 'Contador',
  cleaner: 'Limpiador',
};

const QUICK_LINKS = {
  admin: [
    { label: 'Usuarios',     icon: <People />,        path: '/usuarios' },
    { label: 'Equipos',      icon: <Groups />,        path: '/equipos' },
    { label: 'Sitios',       icon: <LocationOn />,    path: '/sitios' },
    { label: 'Supplies',     icon: <Inventory />,     path: '/supplies' },
    { label: 'Pedidos',      icon: <ShoppingCart />,  path: '/pedidos' },
    { label: 'Vacaciones',   icon: <BeachAccess />,   path: '/vacaciones' },
    { label: 'Quejas',       icon: <Warning />,       path: '/quejas' },
    { label: 'Reportes',     icon: <BarChart />,      path: '/reportes' },
  ],
  manager: [
    { label: 'Equipos',      icon: <Groups />,        path: '/equipos' },
    { label: 'Sitios',       icon: <LocationOn />,    path: '/sitios' },
    { label: 'Supplies',     icon: <Inventory />,     path: '/supplies' },
    { label: 'Pedidos',      icon: <ShoppingCart />,  path: '/pedidos' },
    { label: 'Vacaciones',   icon: <BeachAccess />,   path: '/vacaciones' },
  ],
  accountant: [
    { label: 'Sitios',       icon: <LocationOn />,    path: '/sitios' },
    { label: 'Pedidos',      icon: <ShoppingCart />,  path: '/pedidos' },
    { label: 'Planner',      icon: <CalendarMonth />, path: '/planner' },
    { label: 'Reportes',     icon: <BarChart />,      path: '/reportes' },
  ],
  cleaner: [
    { label: 'Mis Sitios',     icon: <LocationOn />,    path: '/mis-sitios' },
    { label: 'Registrar Logs', icon: <Assignment />,    path: '/registrar-logs' },
    { label: 'Mis Pedidos',    icon: <ShoppingCart />,  path: '/mis-pedidos' },
    { label: 'Mis Vacaciones', icon: <BeachAccess />,   path: '/mis-vacaciones' },
  ],
};

/* ─── Stat Card ─── */
/* ─── Skeleton cards while loading ─── */
function StatsSkeleton({ count = 4 }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid size={{ xs: 6, md: 3 }} key={i}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="rounded" width={48} height={48} />
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

/* ─── Admin Stats ─── */
function AdminStats({ stats, navigate }) {
  const t = stats.totals || {};
  const reportsPending = stats.reports_by_status?.Enviado || 0;
  const ordersPending = stats.orders_by_status?.pending || 0;
  const vacationsPending = stats.pending_vacations ?? 0;
  const complaintsOpen = stats.open_complaints ?? 0;

  return (
    <>
      <SectionTitle>Resumen</SectionTitle>
      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard icon={<People />} label="Usuarios" value={t.users ?? 0} onClick={() => navigate('/usuarios')} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard icon={<Groups />} label="Equipos" value={t.teams ?? 0} onClick={() => navigate('/equipos')} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard icon={<LocationOn />} label="Sitios activos" value={t.active_sites ?? 0} onClick={() => navigate('/sitios')} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard icon={<AccessTime />} label="Horas esta semana" value={stats.hours_this_week ?? 0} />
        </Grid>
      </Grid>

      <SectionTitle>Requiere atención</SectionTitle>
      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<BarChart />}
            label="Reportes pendientes"
            value={reportsPending}
            tone={reportsPending > 0 ? 'warning' : 'primary'}
            highlight={reportsPending > 0}
            onClick={() => navigate('/reportes')}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<ShoppingCart />}
            label="Pedidos pendientes"
            value={ordersPending}
            tone={ordersPending > 0 ? 'warning' : 'primary'}
            highlight={ordersPending > 0}
            onClick={() => navigate('/pedidos')}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<BeachAccess />}
            label="Vacaciones pendientes"
            value={vacationsPending}
            tone={vacationsPending > 0 ? 'info' : 'primary'}
            highlight={vacationsPending > 0}
            onClick={() => navigate('/vacaciones')}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon={<Warning />}
            label="Quejas abiertas"
            value={complaintsOpen}
            tone={complaintsOpen > 0 ? 'error' : 'primary'}
            highlight={complaintsOpen > 0}
            onClick={() => navigate('/quejas')}
          />
        </Grid>
      </Grid>
    </>
  );
}

/* ─── Manager Stats ─── */
function ManagerStats({ stats, navigate }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3.5 }}>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard icon={<Groups />} label="Mis equipos" value={stats.my_teams_count ?? 0} onClick={() => navigate('/equipos')} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard icon={<People />} label="Miembros" value={stats.team_members_count ?? 0} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard icon={<LocationOn />} label="Sitios asignados" value={stats.team_sites_count ?? 0} onClick={() => navigate('/sitios')} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard icon={<AccessTime />} label="Horas esta semana" value={stats.hours_this_week ?? 0} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard icon={<Dashboard />} label="Logs esta semana" value={stats.logs_this_week ?? 0} />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          icon={<ShoppingCart />}
          label="Pedidos pendientes"
          value={stats.pending_orders ?? 0}
          tone={(stats.pending_orders ?? 0) > 0 ? 'warning' : 'primary'}
          highlight={(stats.pending_orders ?? 0) > 0}
          onClick={() => navigate('/pedidos')}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          icon={<BeachAccess />}
          label="Vacaciones pendientes"
          value={stats.pending_vacations ?? 0}
          tone={(stats.pending_vacations ?? 0) > 0 ? 'info' : 'primary'}
          highlight={(stats.pending_vacations ?? 0) > 0}
          onClick={() => navigate('/vacaciones')}
        />
      </Grid>
    </Grid>
  );
}

/* ─── Accountant Stats ─── */
function AccountantStats({ stats, navigate }) {
  const reports = stats.reports_by_status || {};

  const reportCards = [
    { key: 'Enviado',   label: 'Pendientes',  tone: 'warning', icon: <HourglassEmpty /> },
    { key: 'Pagado',    label: 'Pagados',     tone: 'success', icon: <CheckCircle /> },
    { key: 'Devuelto',  label: 'Devueltos',   tone: 'error',   icon: <Warning /> },
    { key: 'Borrador',  label: 'Borradores',  tone: 'primary', icon: <BarChart /> },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3.5 }}>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          icon={<ShoppingCart />}
          label="Pedidos pendientes"
          value={stats.orders_pending_count ?? 0}
          onClick={() => navigate('/pedidos')}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          icon={<LocationOn />}
          label="Sitios activos"
          value={`${stats.active_sites ?? 0} / ${stats.total_sites ?? 0}`}
          onClick={() => navigate('/sitios')}
        />
      </Grid>
      {reportCards.map(({ key, label, tone, icon }) => (
        <Grid size={{ xs: 6, md: 3 }} key={key}>
          <StatCard
            icon={icon}
            label={`Reportes ${label.toLowerCase()}`}
            value={reports[key] ?? 0}
            tone={tone}
            onClick={() => navigate('/reportes')}
          />
        </Grid>
      ))}
    </Grid>
  );
}

/* ─── Cleaner Stats ─── */
function CleanerStats({ stats, navigate }) {
  const sitesToday = stats.sites_today || [];
  const vacation = stats.vacation_status || {};

  return (
    <Grid container spacing={2} sx={{ mb: 3.5 }}>
      {/* Sites today — prominent card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <CalendarMonth color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={700}>
              Sitios de hoy
            </Typography>
            <Chip label={sitesToday.length} size="small" color="primary" sx={{ ml: 'auto' }} />
          </Box>
          {sitesToday.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {sitesToday.map((site, i) => (
                <Box
                  key={site.site_id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, borderTop: i > 0 ? '1px solid' : 'none', borderColor: 'divider' }}
                >
                  <Box
                    sx={{
                      width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                      color: 'primary.main',
                    }}
                  >
                    <LocationOn fontSize="small" />
                  </Box>
                  <Typography variant="body2" fontWeight={600} sx={{ flex: 1, minWidth: 0 }}>
                    {site.nombre}
                  </Typography>
                  {site.horas ? <Chip label={`${site.horas} h`} size="small" variant="outlined" /> : null}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No tienes sitios asignados para hoy
            </Typography>
          )}
        </Paper>
      </Grid>

      {/* Right column — small stat cards */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <StatCard
              icon={<AccessTime />}
              label="Horas esta semana"
              value={stats.hours_this_week ?? 0}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <StatCard
              icon={<Dashboard />}
              label="Logs esta semana"
              value={stats.logs_this_week ?? 0}
              onClick={() => navigate('/registrar-logs')}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <StatCard
              icon={<ShoppingCart />}
              label="Pedidos pendientes"
              value={stats.pending_orders ?? 0}
              onClick={() => navigate('/mis-pedidos')}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <StatCard
              icon={<BeachAccess />}
              label="Vacaciones"
              value={vacation.has_pending ? 'Pendiente' : vacation.next_approved_start ? 'Aprobada' : '—'}
              subtitle={vacation.next_approved_start ? `Desde ${new Date(vacation.next_approved_start).toLocaleDateString()}` : null}
              onClick={() => navigate('/mis-vacaciones')}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

/* ─── Quick link tile ─── */
function QuickLink({ link, onClick }) {
  return (
    <Paper
      elevation={0}
      sx={{
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: (t) => `0 4px 14px ${alpha(t.palette.primary.main, 0.14)}`,
          transform: 'translateY(-1px)',
        },
      }}
    >
      <ButtonBase
        onClick={onClick}
        sx={{ display: 'flex', width: '100%', justifyContent: 'flex-start', gap: 1.5, p: 1.5, textAlign: 'left' }}
      >
        <Box
          sx={{
            width: 40, height: 40, borderRadius: 2, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
            color: 'primary.main',
          }}
        >
          {link.icon}
        </Box>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1, minWidth: 0 }}>
          {link.label}
        </Typography>
        <ChevronRight fontSize="small" sx={{ color: 'text.disabled', flexShrink: 0, display: { xs: 'none', sm: 'block' } }} />
      </ButtonBase>
    </Paper>
  );
}

/* ─── Main Dashboard ─── */
export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data.stats);
    } catch {
      // Stats are non-critical — dashboard still shows quick links
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const links = QUICK_LINKS[user?.rol] || [];
  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayLabel = today.charAt(0).toUpperCase() + today.slice(1);

  const StatsComponent = {
    admin: AdminStats,
    manager: ManagerStats,
    accountant: AccountantStats,
    cleaner: CleanerStats,
  }[user?.rol];

  return (
    <Box>
      {/* Welcome banner */}
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          p: { xs: 2.5, md: 3.5 }, mb: 3.5,
          color: 'primary.contrastText',
          background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`,
          border: 'none',
          // Soft decorative circles
          '&::before, &::after': {
            content: '""', position: 'absolute', borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
          },
          '&::before': { width: 220, height: 220, top: -90, right: -50 },
          '&::after': { width: 140, height: 140, bottom: -70, right: 120 },
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          {greeting}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.25, fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 800 }}>
          {user?.nombre}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 1.5 }}>
          <Chip
            label={ROLE_LABELS[user?.rol]}
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'inherit', fontWeight: 600 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, opacity: 0.9 }}>
            <CalendarMonth sx={{ fontSize: 18 }} />
            <Typography variant="body2">{todayLabel}</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats cards */}
      {loading ? (
        <StatsSkeleton count={user?.rol === 'cleaner' ? 4 : user?.rol === 'admin' ? 8 : 6} />
      ) : (
        stats && StatsComponent && <StatsComponent stats={stats} navigate={navigate} />
      )}

      {/* Quick links */}
      <SectionTitle>Accesos rápidos</SectionTitle>
      <Grid container spacing={2}>
        {links.map(link => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={link.path}>
            <QuickLink link={link} onClick={() => navigate(link.path)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}
