import { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, alpha, useTheme, Collapse,
} from '@mui/material';
import {
  People, Groups, Business, LocationOn, Inventory,
  ShoppingCart, Build, DirectionsCar, BeachAccess,
  BarChart, Warning, Dashboard, Home, CalendarMonth, Assignment,
  ExpandLess, ExpandMore, EditNote,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoLight from '../../assets/images/logo-limpia.png';
import logoDark from '../../assets/images/logo-limpia-dark.png';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Dashboard',      path: '/dashboard',     icon: <Dashboard />,     roles: ['admin','manager','accountant','cleaner'] },
  { label: 'Usuarios',       path: '/usuarios',      icon: <People />,        roles: ['admin','manager'] },
  { label: 'Equipos',        path: '/equipos',       icon: <Groups />,        roles: ['admin','manager'] },
  { label: 'Clientes',       path: '/clientes',      icon: <Business />,      roles: ['admin','manager','accountant'] },
  { label: 'Sitios',         path: '/sitios',        icon: <LocationOn />,    roles: ['admin','manager','accountant'] },
  { label: 'Planner',        path: '/planner',       icon: <CalendarMonth />, roles: ['admin','manager','accountant','cleaner'] },
  { label: 'Mis Sitios',     path: '/mis-sitios',    icon: <Home />,          roles: ['cleaner'] },
  { label: 'Supplies',       path: '/supplies',      icon: <Inventory />,     roles: ['admin','manager'] },
  { label: 'Pedidos',        path: '/pedidos',       icon: <ShoppingCart />,  roles: ['admin','manager','accountant'] },
  { label: 'Mis Pedidos',    path: '/mis-pedidos',   icon: <ShoppingCart />,  roles: ['cleaner'] },
  { label: 'Herramientas',   path: '/herramientas',  icon: <Build />,         roles: ['admin','manager'] },
  { label: 'Vehículos',      path: '/vehiculos',     icon: <DirectionsCar />, roles: ['admin','manager'] },
  { label: 'Vacaciones',     path: '/vacaciones',    icon: <BeachAccess />,   roles: ['admin','manager'] },
  { label: 'Mis Vacaciones', path: '/mis-vacaciones',icon: <BeachAccess />,   roles: ['cleaner'] },
  {
    label: 'Mis Reportes', icon: <Assignment />, roles: ['cleaner'],
    children: [
      { label: 'Registrar Logs', path: '/registrar-logs', icon: <EditNote /> },
      { label: 'Mis Reportes',   path: '/mis-reportes',   icon: <Assignment /> },
    ],
  },
  { label: 'Quejas',         path: '/quejas',        icon: <Warning />,       roles: ['admin','manager'] },
  { label: 'Reportes',       path: '/reportes',      icon: <BarChart />,      roles: ['admin','accountant'] },
];

export default function Sidebar({ open, onClose, variant = 'permanent' }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const visible = NAV_ITEMS.filter(item => item.roles.includes(user?.rol));

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  // Auto-open groups that contain the active route
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    visible.forEach(item => {
      if (item.children) {
        const hasActive = item.children.some(c => isActive(c.path));
        if (hasActive) initial[item.label] = true;
      }
    });
    return initial;
  });

  const toggleGroup = (label) =>
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));

  const theme = useTheme();
  const logo = theme.palette.mode === 'dark' ? logoDark : logoLight;

  const itemStyle = (active) => ({
    borderRadius: 2,
    py: 0.9,
    px: 1.5,
    ...(active
      ? {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
          '&:hover': { bgcolor: 'primary.dark' },
        }
      : {
          color: 'text.secondary',
          '& .MuiListItemIcon-root': { color: 'text.secondary' },
          '&:hover': {
            bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
            color: 'primary.main',
            '& .MuiListItemIcon-root': { color: 'primary.main' },
          },
        }),
  });

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo area */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          component="img"
          src={logo}
          alt="Limpia Cleaning"
          sx={{ height: 40, width: 40, objectFit: 'contain' }}
        />
        <Box>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.2, color: 'text.primary' }}>
            Limpia
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}>
            Cleaning Pty Ltd
          </Typography>
        </Box>
      </Box>

      {/* Nav */}
      <List sx={{ flex: 1, px: 1.5 }}>
        {visible.map(item => {
          // Collapsible group
          if (item.children) {
            const groupOpen = !!openGroups[item.label];
            const groupActive = item.children.some(c => isActive(c.path));
            return (
              <Box key={item.label}>
                <ListItem disablePadding sx={{ mb: 0.3 }}>
                  <ListItemButton
                    onClick={() => toggleGroup(item.label)}
                    sx={itemStyle(false)}
                  >
                    <ListItemIcon sx={{ minWidth: 36, fontSize: 20 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.8125rem',
                        fontWeight: groupActive ? 600 : 500,
                        color: groupActive ? 'primary.main' : undefined,
                      }}
                    />
                    {groupOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={groupOpen} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ pl: 1.5 }}>
                    {item.children.map(child => {
                      const active = isActive(child.path);
                      return (
                        <ListItem key={child.path} disablePadding sx={{ mb: 0.3 }}>
                          <ListItemButton
                            onClick={() => { navigate(child.path); if (onClose) onClose(); }}
                            sx={itemStyle(active)}
                          >
                            <ListItemIcon sx={{ minWidth: 30, fontSize: 18 }}>{child.icon}</ListItemIcon>
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{ fontSize: '0.78rem', fontWeight: active ? 600 : 500 }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          }

          // Regular item
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                onClick={() => { navigate(item.path); if (onClose) onClose(); }}
                sx={itemStyle(active)}
              >
                <ListItemIcon sx={{ minWidth: 36, fontSize: 20 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: active ? 600 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer version */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', textTransform: 'none', letterSpacing: 0 }}>
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={variant === 'temporary' ? open : true}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
}
