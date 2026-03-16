import { Box, Typography, Paper, Grid, alpha } from '@mui/material';
import {
  People, Groups, LocationOn, Inventory,
  ShoppingCart, BeachAccess, BarChart, Warning,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
    { label: 'Reportes',     icon: <BarChart />,      path: '/reportes' },
  ],
  cleaner: [
    { label: 'Mis Sitios',   icon: <LocationOn />,    path: '/mis-sitios' },
    { label: 'Mis Pedidos',  icon: <ShoppingCart />,  path: '/mis-pedidos' },
    { label: 'Mis Vacaciones', icon: <BeachAccess />, path: '/mis-vacaciones' },
  ],
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const links = QUICK_LINKS[user?.rol] || [];
  const greeting = getGreeting();

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
