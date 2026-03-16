import {
  AppBar, Toolbar, IconButton, Typography, Box, Tooltip, Avatar, alpha,
} from '@mui/material';
import { Brightness4, Brightness7, Logout, Menu } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 260;

const ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Manager',
  accountant: 'Contador',
  cleaner: 'Limpiador',
};

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.nombre
    ? user.nombre.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        // On desktop, offset by sidebar width so it doesn't cover the logo
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ display: { md: 'none' } }}
        >
          <Menu />
        </IconButton>

        {/* spacer */}
        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
            <IconButton onClick={toggleMode} size="small" sx={{ color: 'text.secondary' }}>
              {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              py: 0.5, px: 1.5,
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
          </Box>

          <Tooltip title="Cerrar sesión">
            <IconButton onClick={handleLogout} size="small" sx={{ color: 'text.secondary' }}>
              <Logout fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
