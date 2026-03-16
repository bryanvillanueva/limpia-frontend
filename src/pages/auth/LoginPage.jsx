import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, LightMode, DarkMode } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { loginRequest } from '../../services/auth.service';
import logoLight from '../../assets/images/logo-limpia.png';
import logoDark from '../../assets/images/logo-limpia-dark.png';
import bgLight from '../../assets/images/login-background-light.jpg';
import bgDark from '../../assets/images/login-background-dark.jpg';

/**
 * LoginPage renders the main authentication screen as a two-panel layout.
 * The left side shows a contextual illustration that switches between light
 * and dark variants; the right side contains the email/password form.
 * It uses AuthContext for login and currently exposes a visual "forgot password"
 * entry point only, without implementing the actual recovery flow yet.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { mode, toggleMode } = useThemeMode();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handles login submission with email and password.
   * Prevents default form behavior, calls the auth service, stores
   * the returned token and user via AuthContext, and redirects to
   * the dashboard. On failure, shows a generic or backend-provided
   * error message to the user.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await loginRequest(email, password);
      login(data.token, data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const isDark = mode === 'dark';
  const logo = isDark ? logoDark : logoLight;
  const bg = isDark ? bgDark : bgLight;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%',
          maxWidth: 960,
          bgcolor: 'background.paper',
          boxShadow: 4,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* Left — form panel */}
        <Box
          sx={{
            width: { xs: '100%', md: '50%' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: { xs: 3, sm: 5 },
            py: 4,
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 5 }}>
            <Box
              component="img"
              src={logo}
              alt="Limpia Cleaning"
              sx={{ height: 152, display: 'block',  }}
            />
          </Box>

          {/* Welcome text */}
          <Typography variant="h5" sx={{ mb: 0.5 }}>
            Iniciar sesión
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
            Ingresa tus credenciales para acceder al sistema.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography
              variant="caption"
              sx={{
                mb: 0.5,
                display: 'block',
                color: 'text.secondary',
                textTransform: 'none',
                letterSpacing: 0,
              }}
            >
              Email
            </Typography>
          <TextField
            placeholder="tu@email.com"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2.5 }}
            autoComplete="email"
            autoFocus
          />

            <Typography
              variant="caption"
              sx={{
                mb: 0.5,
                display: 'block',
                color: 'text.secondary',
                textTransform: 'none',
                letterSpacing: 0,
              }}
            >
              Contraseña
            </Typography>
            <TextField
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="current-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mb: 3,
            }}
          >
            <Typography
              variant="body2"
              color="primary"
              sx={{ fontSize: '0.75rem', fontWeight: 600, cursor: 'default' }}
            >
              ¿Olvidaste tu contraseña?
            </Typography>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ py: 1.4 }}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </Box>

        {/* Footer */}
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{
            mt: 'auto',
            pt: 4,
            textTransform: 'none',
            letterSpacing: 0,
            textAlign: 'center',
          }}
        >
          Limpia Cleaning Pty Ltd
        </Typography>
      </Box>

      {/* Right — image panel */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          position: 'relative',
          minHeight: { xs: 220, md: 'auto' },
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* Background image */}
        <Box
          component="img"
          src={bg}
          alt=""
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Theme toggle */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '999px',
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: 'primary.main',
            bgcolor: isDark ? 'common.black' : 'common.white',
            color: isDark ? 'primary.main' : 'primary.main',
            cursor: 'pointer',
            zIndex: 3,
            transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          }}
          onClick={toggleMode}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDark ? (
            <LightMode fontSize="small" />
          ) : (
            <DarkMode fontSize="small" />
          )}
        </Box>
        {/* Gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            background: isDark
              ? 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)'
              : 'linear-gradient(135deg, rgba(38,97,79,0.65) 0%, rgba(38,97,79,0.2) 100%)',
          }}
        />
        {/* Overlay text (above gradient) */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 5,
            zIndex: 2,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={800}
            color="white"
            sx={{ mb: 1 }}
          >
            Limpia Cleaning
          </Typography>
          <Typography
            variant="body1"
            color="white"
            sx={{ opacity: 0.85, maxWidth: 400 }}
          >
            Sistema interno de gestión de equipos, sitios y operaciones diarias.
          </Typography>
        </Box>
      </Box>
    </Box>
    </Box>
  );
}
