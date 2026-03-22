import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, alpha, Skeleton, Chip,
  List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import {
  People, Groups, LocationOn, Inventory,
  ShoppingCart, BeachAccess, BarChart, Warning,
  Dashboard, AccessTime, CalendarMonth, Assignment,
  CheckCircle, HourglassEmpty,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/dashboard.service';

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
function StatCard({ icon, label, value, subtitle, color = 'primary.main', onClick }) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
        ...(onClick && {
          '&:hover': {
            borderColor: color,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
            transform: 'translateY(-1px)',
          },
        }),
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
            color,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {label}
          </Typography>
        </Box>
      </Box>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}

/* ─── Skeleton cards while loading ─── */
function StatsSkeleton({ count = 4 }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
          <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Skeleton variant="rounded" width={44} height={44} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width={60} height={32} />
                <Skeleton width={100} height={16} />
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

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <StatCard icon={<People />} label="Usuarios" value={t.users ?? 0} onClick={() => navigate('/usuarios')} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <StatCard icon={<Groups />} label="Equipos" value={t.teams ?? 0} onClick={() => navigate('/equipos')} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <StatCard icon={<LocationOn />} label="Sitios activos" value={t.active_sites ?? 0} onClick={() => navigate('/sitios')} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <StatCard icon={<AccessTime />} label="Horas esta semana" value={stats.hours_this_week ?? 0} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <StatCard
          icon={<BarChart />}
          label="Reportes pendientes"
          value={reportsPending}
          onClick={() => navigate('/reportes')}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <StatCard
          icon={<ShoppingCart />}
          label="Pedidos pendientes"
          value={ordersPending}
          onClick={() => navigate('/pedidos')}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <StatCard
          icon={<BeachAccess />}
          label="Vacaciones pendientes"
          value={stats.pending_vacations ?? 0}
          onClick={() => navigate('/vacaciones')}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 2 }}>
        <StatCard
          icon={<Warning />}
          label="Quejas abiertas"
          value={stats.open_complaints ?? 0}
          onClick={() => navigate('/quejas')}
        />
      </Grid>
    </Grid>
  );
}

/* ─── Manager Stats ─── */
function ManagerStats({ stats, navigate }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <StatCard icon={<Groups />} label="Mis equipos" value={stats.my_teams_count ?? 0} onClick={() => navigate('/equipos')} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <StatCard icon={<People />} label="Miembros" value={stats.team_members_count ?? 0} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <StatCard icon={<LocationOn />} label="Sitios asignados" value={stats.team_sites_count ?? 0} onClick={() => navigate('/sitios')} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <StatCard icon={<AccessTime />} label="Horas esta semana" value={stats.hours_this_week ?? 0} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <StatCard icon={<Dashboard />} label="Logs esta semana" value={stats.logs_this_week ?? 0} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <StatCard icon={<ShoppingCart />} label="Pedidos pendientes" value={stats.pending_orders ?? 0} onClick={() => navigate('/pedidos')} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <StatCard icon={<BeachAccess />} label="Vacaciones pendientes" value={stats.pending_vacations ?? 0} onClick={() => navigate('/vacaciones')} />
      </Grid>
    </Grid>
  );
}

/* ─── Accountant Stats ─── */
function AccountantStats({ stats, navigate }) {
  const reports = stats.reports_by_status || {};

  const reportCards = [
    { key: 'Enviado',   label: 'Pendientes',  color: 'warning.main',  icon: <HourglassEmpty /> },
    { key: 'Pagado',    label: 'Pagados',     color: 'success.main',  icon: <CheckCircle /> },
    { key: 'Devuelto',  label: 'Devueltos',   color: 'error.main',    icon: <Warning /> },
    { key: 'Borrador',  label: 'Borradores',  color: 'text.secondary', icon: <BarChart /> },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <StatCard
          icon={<ShoppingCart />}
          label="Pedidos pendientes"
          value={stats.orders_pending_count ?? 0}
          onClick={() => navigate('/pedidos')}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 4, md: 3 }}>
        <StatCard
          icon={<LocationOn />}
          label="Sitios activos"
          value={`${stats.active_sites ?? 0} / ${stats.total_sites ?? 0}`}
          onClick={() => navigate('/sitios')}
        />
      </Grid>
      {reportCards.map(({ key, label, color, icon }) => (
        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={key}>
          <StatCard
            icon={icon}
            label={`Reportes ${label}`}
            value={reports[key] ?? 0}
            color={color}
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
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* Sites today — prominent card */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <CalendarMonth color="primary" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={700}>
              Sitios de hoy
            </Typography>
            <Chip label={sitesToday.length} size="small" color="primary" sx={{ ml: 'auto' }} />
          </Box>
          {sitesToday.length > 0 ? (
            <List dense disablePadding>
              {sitesToday.map((site) => (
                <ListItem key={site.site_id} disablePadding sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LocationOn fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={site.nombre}
                    secondary={site.horas ? `${site.horas}h` : null}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
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
          p: 3, mb: 3,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.12),
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {greeting}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.25 }}>
          {user?.nombre}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {ROLE_LABELS[user?.rol]} &middot; {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </Typography>
      </Paper>

      {/* Stats cards */}
      {loading ? (
        <StatsSkeleton count={user?.rol === 'cleaner' ? 4 : user?.rol === 'admin' ? 8 : 6} />
      ) : (
        stats && StatsComponent && <StatsComponent stats={stats} navigate={navigate} />
      )}

      {/* Quick links */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        Accesos rápidos
      </Typography>
      <Grid container spacing={2}>
        {links.map(link => (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={link.path}>
            <Paper
              elevation={0}
              onClick={() => navigate(link.path)}
              sx={{
                p: 2.5, textAlign: 'center', cursor: 'pointer',
                border: '1px solid', borderColor: 'divider',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 1 }}>{link.icon}</Box>
              <Typography variant="body2" fontWeight={600}>{link.label}</Typography>
            </Paper>
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
