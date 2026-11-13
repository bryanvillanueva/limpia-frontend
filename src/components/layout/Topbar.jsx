import {
  AppBar, Toolbar, IconButton, Typography, Box, Tooltip, Avatar, ButtonBase, alpha, useMediaQuery, useTheme,
} from '@mui/material';
import { Brightness4, Brightness7, Logout, Menu, MenuOpen } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useLayout } from '../../context/layoutState';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

const ROLE_LABELS = {
  admin: 'Administrador',
  manager: 'Manager',
  accountant: 'Contador',
  cleaner: 'Limpiador',
};

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const { collapsed, toggleCollapsed, drawerWidth } = useLayout();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.nombre
    ? user.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  // Desktop: collapse / expand the sidebar. Mobile: open the drawer.
  const menuLabel = isDesktop ? (collapsed ? 'Expandir menú' : 'Contraer menú') : 'Abrir menú';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        // On desktop, offset by the sidebar width so it doesn't cover the logo
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        transition: theme.transitions.create(['width', 'margin'], { duration: theme.transitions.duration.shorter }),
        // Keep content clear of the notch / status bar when installed as a PWA
        pt: 'env(safe-area-inset-top)',
      }}
    >
      <Toolbar sx={{ gap: 1, px: { xs: 1, sm: 3 } }}>
        <Tooltip title={isDesktop ? menuLabel : ''}>
          <IconButton
            edge="start"
            aria-label={menuLabel}
            aria-expanded={isDesktop ? !collapsed : undefined}
            onClick={isDesktop ? toggleCollapsed : onMenuClick}
            sx={{ color: 'text.secondary' }}
          >
            {isDesktop && !collapsed ? <MenuOpen /> : <Menu />}
          </IconButton>
        </Tooltip>

        {/* Brand — only on mobile, where the sidebar logo is hidden */}
        <Typography
          variant="subtitle1"
          sx={{ display: { xs: 'block', md: 'none' }, fontWeight: 700, color: 'primary.main' }}
        >
          Limpia
        </Typography>

        {/* spacer */}
        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          <NotificationBell />

          <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            <IconButton onClick={toggleMode} size="small" aria-label="Cambiar tema" sx={{ color: 'text.secondary' }}>
              {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* The user chip opens the profile */}
          <ButtonBase
            onClick={() => navigate('/perfil')}
            aria-label="Mi perfil"
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.25, textAlign: 'left',
              bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
              '&:hover': { bgcolor: (t) => alpha(t.palette.primary.main, 0.1) },
              borderRadius: '10px',
              py: 0.5, px: { xs: 0.5, sm: 1.25 },
              ml: 0.5,
            }}
          >
            <Avatar
              sx={{
                width: 30, height: 30, fontSize: '0.75rem', fontWeight: 700,
                bgcolor: 'primary.main', color: 'primary.contrastText',
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>
                {user?.nombre}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'none', letterSpacing: 0, fontSize: '0.6875rem' }}>
                {ROLE_LABELS[user?.rol] || user?.rol}
              </Typography>
            </Box>
          </ButtonBase>

          <Tooltip title="Cerrar sesión">
            <IconButton onClick={handleLogout} size="small" aria-label="Cerrar sesión" sx={{ color: 'text.secondary' }}>
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
