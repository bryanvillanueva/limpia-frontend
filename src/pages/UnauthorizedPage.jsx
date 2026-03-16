import { Box, Typography, Button, alpha } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 2 }}>
      <Box
        sx={{
          width: 64, height: 64, borderRadius: 3,
          bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <LockOutlined sx={{ fontSize: 32, color: 'error.main' }} />
      </Box>
      <Typography variant="h5">Sin autorización</Typography>
      <Typography variant="body2" color="text.secondary">
        No tienes permisos para acceder a esta página.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')} sx={{ mt: 1 }}>
        Volver al inicio
      </Button>
    </Box>
  );
}
