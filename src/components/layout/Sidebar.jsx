import { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, alpha, useTheme, Collapse, Tooltip, Divider,
} from '@mui/material';
import {
  People, Groups, Business, LocationOn, Inventory,
  ShoppingCart, Build, DirectionsCar, BeachAccess,
  BarChart, Warning, Dashboard, Home, CalendarMonth, Assignment,
  ExpandLess, ExpandMore, EditNote, AccountCircle,
  KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLayout, DRAWER_WIDTH, DRAWER_COLLAPSED_WIDTH } from '../../context/layoutState';
import logoLight from '../../assets/images/logo-limpia.png';
import logoDark from '../../assets/images/logo-limpia-dark.png';

const ALL = ['admin', 'manager', 'accountant', 'cleaner'];

/** Navigation grouped by area, so long menus (admin) are easier to scan. Empty sections are hidden. */
const NAV_SECTIONS = [
  {
    title: null,
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: <Dashboard />, roles: ALL },
    ],
  },
  {
    title: 'Operación',
    items: [
      { label: 'Planner',    path: '/planner',    icon: <CalendarMonth />, roles: ALL },
      { label: 'Mis Sitios', path: '/mis-sitios', icon: <Home />,          roles: ['cleaner'] },
      {
        label: 'Mis Reportes', icon: <Assignment />, roles: ['cleaner'],
        children: [
          { label: 'Registrar Logs', path: '/registrar-logs', icon: <EditNote /> },
          { label: 'Mis Reportes',   path: '/mis-reportes',   icon: <Assignment /> },
        ],
      },
      { label: 'Sitios',     path: '/sitios',     icon: <LocationOn />,    roles: ['admin', 'manager', 'accountant'] },
      { label: 'Clientes',   path: '/clientes',   icon: <Business />,      roles: ['admin', 'manager', 'accountant'] },
    ],
  },
  {
    title: 'Personas',
    items: [
      { label: 'Usuarios',       path: '/usuarios',       icon: <People />,      roles: ['admin', 'manager'] },
      { label: 'Equipos',        path: '/equipos',        icon: <Groups />,      roles: ['admin', 'manager'] },
      { label: 'Vacaciones',     path: '/vacaciones',     icon: <BeachAccess />, roles: ['admin', 'manager'] },
      { label: 'Mis Vacaciones', path: '/mis-vacaciones', icon: <BeachAccess />, roles: ['cleaner'] },
      { label: 'Quejas',         path: '/quejas',         icon: <Warning />,     roles: ['admin', 'manager'] },
    ],
  },
  {
    title: 'Recursos',
    items: [
      { label: 'Supplies',     path: '/supplies',     icon: <Inventory />,     roles: ['admin', 'manager'] },
      { label: 'Pedidos',      path: '/pedidos',      icon: <ShoppingCart />,  roles: ['admin', 'manager', 'accountant'] },
      { label: 'Mis Pedidos',  path: '/mis-pedidos',  icon: <ShoppingCart />,  roles: ['cleaner'] },
      { label: 'Herramientas', path: '/herramientas', icon: <Build />,         roles: ['admin', 'manager'] },
      { label: 'Vehículos',    path: '/vehiculos',    icon: <DirectionsCar />, roles: ['admin', 'manager'] },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { label: 'Reportes', path: '/reportes', icon: <BarChart />, roles: ['admin', 'accountant'] },
    ],
  },
  {
    title: 'Cuenta',
    items: [
      { label: 'Mi Perfil', path: '/perfil', icon: <AccountCircle />, roles: ALL },
    ],
  },
];

/**
 * App sidebar.
 *  - Desktop (permanent): can be collapsed to an icon rail; labels move to tooltips.
 *  - Mobile (temporary): always expanded, closes after navigating.
 */
export default function Sidebar({ open, onClose, variant = 'permanent' }) {
  const { user } = useAuth();
  const { collapsed: collapsedPref, toggleCollapsed } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const logo = theme.palette.mode === 'dark' ? logoDark : logoLight;

  const isTemporary = variant === 'temporary';
  const collapsed = !isTemporary && collapsedPref;
  const width = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  const sections = NAV_SECTIONS
    .map((s) => ({ ...s, items: s.items.filter((i) => i.roles.includes(user?.rol)) }))
    .filter((s) => s.items.length > 0);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Groups containing the active route start open
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    sections.forEach((s) => s.items.forEach((item) => {
      if (item.children?.some((c) => isActive(c.path))) initial[item.label] = true;
    }));
    return initial;
  });
  const toggleGroup = (label) => setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const go = (path) => { navigate(path); if (onClose) onClose(); };

  const itemSx = (active, nested = false) => ({
    minHeight: 40,
    borderRadius: '10px',
    px: collapsed ? 0 : 1.5,
    justifyContent: collapsed ? 'center' : 'flex-start',
    ...(nested && !collapsed && { pl: 1.25 }),
    '& .MuiListItemIcon-root': {
      minWidth: collapsed ? 0 : 34,
      justifyContent: 'center',
      '& svg': { fontSize: nested ? 19 : 20 },
    },
    '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 },
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
            bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
            color: 'primary.main',
            '& .MuiListItemIcon-root': { color: 'primary.main' },
          },
        }),
  });

  const labelProps = (active, nested = false) => ({
    primary: { fontSize: nested ? '0.8rem' : '0.8125rem', fontWeight: active ? 600 : 500, noWrap: true },
  });

  /** One link. Collapsed: icon only, with the label in a tooltip and as accessible name. */
  const navLink = (item, nested = false) => {
    const active = isActive(item.path);
    const button = (
      <ListItemButton
        onClick={() => go(item.path)}
        aria-current={active ? 'page' : undefined}
        aria-label={collapsed ? item.label : undefined}
        sx={itemSx(active, nested)}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        {!collapsed && <ListItemText primary={item.label} slotProps={labelProps(active, nested)} />}
      </ListItemButton>
    );
    return (
      <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
        {collapsed ? <Tooltip title={item.label} placement="right" arrow>{button}</Tooltip> : button}
      </ListItem>
    );
  };

  const renderItem = (item) => {
    if (!item.children) return navLink(item);

    // Collapsed rail: the group's pages are shown directly as icons
    if (collapsed) return item.children.map((child) => navLink(child));

    const groupOpen = !!openGroups[item.label];
    const groupActive = item.children.some((c) => isActive(c.path));
    return (
      <Box key={item.label}>
        <ListItem disablePadding sx={{ mb: 0.25 }}>
          <ListItemButton onClick={() => toggleGroup(item.label)} aria-expanded={groupOpen} sx={itemSx(false)}>
            <ListItemIcon sx={groupActive ? { color: 'primary.main !important' } : undefined}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { fontSize: '0.8125rem', fontWeight: groupActive ? 600 : 500, color: groupActive ? 'primary.main' : undefined } }}
            />
            {groupOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          </ListItemButton>
        </ListItem>
        <Collapse in={groupOpen} timeout="auto" unmountOnExit>
          {/* A guide line ties the sub-pages to their group */}
          <List disablePadding sx={{ ml: 2.75, pl: 1, borderLeft: '1px solid', borderColor: 'divider', mb: 0.5 }}>
            {item.children.map((child) => navLink(child, true))}
          </List>
        </Collapse>
      </Box>
    );
  };

  const toggleLabel = collapsed ? 'Expandir menú' : 'Contraer menú';

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflowX: 'hidden' }}>
      {/* Brand */}
      <Box
        sx={{
          height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 1.25,
          px: collapsed ? 0 : 2.5, justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <Box component="img" src={logo} alt="Limpia Cleaning" sx={{ height: 36, width: 36, objectFit: 'contain', flexShrink: 0 }} />
        {!collapsed && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap sx={{ lineHeight: 1.2, fontWeight: 700, color: 'text.primary' }}>Limpia</Typography>
            <Typography variant="caption" noWrap sx={{ display: 'block', color: 'text.secondary', textTransform: 'none', letterSpacing: 0 }}>
              Cleaning Pty Ltd
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box component="nav" aria-label="Menú principal" sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: collapsed ? 1.25 : 1.5, pb: 1 }}>
        {sections.map((section, i) => (
          <Box key={section.title || 'main'} sx={{ mt: i === 0 ? 0.5 : 1.5 }}>
            {section.title && (collapsed ? (
              <Divider sx={{ mx: 1, mb: 1 }} />
            ) : (
              <Typography
                component="div"
                sx={{
                  px: 1.5, mb: 0.5, fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: 'text.disabled',
                }}
              >
                {section.title}
              </Typography>
            ))}
            <List disablePadding>{section.items.map(renderItem)}</List>
          </Box>
        ))}
      </Box>

      {/* Footer: collapse toggle (desktop) + version */}
      <Box sx={{ flexShrink: 0, borderTop: '1px solid', borderColor: 'divider', px: collapsed ? 1.25 : 1.5, py: 1 }}>
        {!isTemporary && (
          <Tooltip title={collapsed ? toggleLabel : ''} placement="right" arrow>
            <ListItemButton
              onClick={toggleCollapsed}
              aria-label={toggleLabel}
              aria-expanded={!collapsed}
              sx={{
                ...itemSx(false),
                minHeight: 36,
              }}
            >
              <ListItemIcon>{collapsed ? <KeyboardDoubleArrowRight /> : <KeyboardDoubleArrowLeft />}</ListItemIcon>
              {!collapsed && <ListItemText primary="Contraer menú" slotProps={labelProps(false)} />}
            </ListItemButton>
          </Tooltip>
        )}
        {!collapsed && (
          <Typography variant="caption" component="div" sx={{ px: 1.5, pt: 0.5, color: 'text.disabled', textTransform: 'none', letterSpacing: 0 }}>
            v1.0.0
          </Typography>
        )}
      </Box>
    </Box>
  );

  const widthTransition = theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter,
  });

  return (
    <Drawer
      variant={variant}
      open={isTemporary ? open : true}
      onClose={onClose}
      ModalProps={{ keepMounted: true }} // smoother open on mobile
      sx={{
        width,
        flexShrink: 0,
        transition: widthTransition,
        '& .MuiDrawer-paper': {
          width,
          maxWidth: '85vw',
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          overflowX: 'hidden',
          transition: widthTransition,
          pt: 'env(safe-area-inset-top)',
          pb: 'env(safe-area-inset-bottom)',
        },
      }}
    >
      {content}
    </Drawer>
  );
}
