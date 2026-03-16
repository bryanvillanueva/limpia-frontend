import { useState, useEffect } from 'react';
import {
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Box,
  Typography,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Email,
  Lock,
  Badge,
  Home,
  Phone,
  CardTravel,
  Event,
} from '@mui/icons-material';
import FormModal from '../../components/ui/FormModal';
import { createUser, updateUser } from '../../services/users.service';

const ROLES = ['admin', 'manager', 'accountant', 'cleaner'];
const ROLE_LABELS = { admin: 'Administrador', manager: 'Manager', accountant: 'Contador', cleaner: 'Limpiador' };

const EMPTY = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  rol: 'cleaner',
  direccion: '',
  telefono: '',
  fecha_vencimiento_visa: '',
  tipo_visa: '',
};

const NULLABLE_FIELDS = ['direccion', 'telefono', 'fecha_vencimiento_visa', 'tipo_visa'];

/**
 * Encabezado de sección dentro del formulario.
 * Muestra un título con tipografía caption y un texto opcional de ayuda.
 */
function SectionHeader({ title, optional }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {optional && (
        <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 400 }}>
          (opcional)
        </Typography>
      )}
    </Box>
  );
}

/**
 * Modal de formulario reutilizable para crear y editar usuarios del sistema.
 * Renderiza campos básicos de cuenta más datos opcionales (dirección, teléfono y datos de visa).
 * Cuando se edita un usuario, muestra un panel con los valores actuales para comparación.
 * No asume contexto externo más allá de las props controladas y los servicios de usuario.
 */
export default function UserFormModal({ open, onClose, user, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(user ? {
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        password: '',
        rol: user.rol || 'cleaner',
        direccion: user.direccion || '',
        telefono: user.telefono || '',
        fecha_vencimiento_visa: user.fecha_vencimiento_visa || '',
        tipo_visa: user.tipo_visa || '',
      } : EMPTY);
      setError('');
    }
  }, [open, user]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };

      NULLABLE_FIELDS.forEach((field) => {
        if (payload[field] !== undefined && payload[field] !== null && String(payload[field]).trim() === '') {
          payload[field] = null;
        }
      });

      if (user && !payload.password) delete payload.password;
      if (user) {
        await updateUser(user.id, payload);
      } else {
        await createUser(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal open={open} onClose={onClose} title={user ? 'Editar usuario' : 'Nuevo usuario'} maxWidth="sm">
      <form onSubmit={handleSubmit} autoComplete="off">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ───────────────────── Información de cuenta ───────────────────── */}
        <SectionHeader title="Información de cuenta" />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Nombre"
              value={form.nombre}
              onChange={set('nombre')}
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ autoComplete: 'off' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Apellido"
              value={form.apellido}
              onChange={set('apellido')}
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ autoComplete: 'off' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ autoComplete: 'off' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={user ? 'Nueva contraseña' : 'Contraseña'}
              type="password"
              value={form.password}
              onChange={set('password')}
              required={!user}
              fullWidth
              helperText={user ? 'Dejar en blanco para mantener la actual' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ autoComplete: 'new-password' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Rol"
              value={form.rol}
              onChange={set('rol')}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ autoComplete: 'off' }}
            >
              {ROLES.map(r => (
                <MenuItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        {/* ───────────────────── Información de contacto ───────────────────── */}
        <SectionHeader title="Información de contacto" optional />
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              label="Dirección"
              value={form.direccion}
              onChange={set('direccion')}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ autoComplete: 'off' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Teléfono"
              value={form.telefono}
              onChange={set('telefono')}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ autoComplete: 'off' }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        {/* ───────────────────── Información de visa ───────────────────── */}
        <SectionHeader title="Información de visa" optional />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Tipo de visa"
              value={form.tipo_visa}
              onChange={set('tipo_visa')}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CardTravel fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ autoComplete: 'off' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Fecha vencimiento visa"
              type="date"
              value={form.fecha_vencimiento_visa}
              onChange={set('fecha_vencimiento_visa')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Event fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ autoComplete: 'off' }}
            />
          </Grid>
        </Grid>

        <DialogActions sx={{ px: 0, pt: 3, pb: 0 }}>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </FormModal>
  );
}
