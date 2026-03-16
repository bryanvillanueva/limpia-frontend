import { useState, useEffect } from 'react';
import {
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  Box,
  Typography,
  Divider,
  InputAdornment,
} from '@mui/material';
import { Business, Email, Phone, Home } from '@mui/icons-material';
import FormModal from '../../components/ui/FormModal';
import { createClient, updateClient } from '../../services/clients.service';

const EMPTY = {
  nombre: '',
  email: '',
  telefono: '',
  direccion: '',
};

const NULLABLE_FIELDS = ['email', 'telefono', 'direccion'];

/**
 * Section header for form sections.
 * Shows a title with optional "(opcional)" label.
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
 * ClientFormModal – Modal for creating and editing clients.
 * Displays fields organized in sections (basic info + contact).
 * Follows UserFormModal patterns: icons, section headers, proper spacing.
 * Does not assume external context beyond controlled props and clients service.
 */
export default function ClientFormModal({ open, onClose, client, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        client
          ? {
              nombre: client.nombre || '',
              email: client.email || '',
              telefono: client.telefono || '',
              direccion: client.direccion || '',
            }
          : EMPTY
      );
      setError('');
    }
  }, [open, client]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };

      NULLABLE_FIELDS.forEach((field) => {
        if (
          payload[field] !== undefined &&
          payload[field] !== null &&
          String(payload[field]).trim() === ''
        ) {
          payload[field] = null;
        }
      });

      if (client) {
        await updateClient(client.id, payload);
      } else {
        await createClient(payload);
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
    <FormModal
      open={open}
      onClose={onClose}
      title={client ? 'Editar cliente' : 'Nuevo cliente'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* ───────────────────── Información básica ───────────────────── */}
        <SectionHeader title="Información básica" />
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              label="Nombre del cliente"
              value={form.nombre}
              onChange={set('nombre')}
              required
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Business fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ autoComplete: 'off' }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        {/* ───────────────────── Información de contacto ───────────────────── */}
        <SectionHeader title="Información de contacto" optional />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
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
          <Grid size={12}>
            <TextField
              label="Dirección"
              value={form.direccion}
              onChange={set('direccion')}
              fullWidth
              multiline
              rows={2}
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
