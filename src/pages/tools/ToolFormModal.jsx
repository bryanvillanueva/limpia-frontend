/**
 * Modal form for creating / editing a tool.
 * Fields map to the `tools` DB table: code, nombre, descripcion, requiere_mantenimiento,
 * fecha_ultimo_mantenimiento, precio_unitario, ubicacion, equipo_id.
 *
 * When ubicacion is "asignada", equipo_id becomes required and shows a team selector.
 * When ubicacion is "oficina" (default), equipo_id is cleared and hidden.
 *
 * @param {boolean}  open    - Controls modal visibility.
 * @param {function} onClose - Callback to close the modal.
 * @param {object|null} tool - Existing tool data for edit mode, or null for create.
 * @param {function} onSaved - Callback after successful save (triggers list reload).
 */
import { useState, useEffect } from 'react';
import {
  DialogActions, Button, TextField, MenuItem, Grid, Alert,
  FormControlLabel, Switch,
} from '@mui/material';
import FormModal from '../../components/ui/FormModal';
import { createTool, updateTool } from '../../services/tools.service';
import { getTeams } from '../../services/teams.service';

const UBICACIONES = [
  { value: 'oficina', label: 'Oficina' },
  { value: 'asignada', label: 'Asignada a equipo' },
];

const EMPTY = {
  code: '',
  nombre: '',
  descripcion: '',
  requiere_mantenimiento: false,
  fecha_ultimo_mantenimiento: '',
  precio_unitario: '',
  ubicacion: 'oficina',
  equipo_id: '',
};

/**
 * Normalises a date value from the API to YYYY-MM-DD for <input type="date" />.
 * @param {string|null} val - Raw date value.
 * @returns {string} Formatted date or empty string.
 */
const toDateInput = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

export default function ToolFormModal({ open, onClose, tool, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      getTeams()
        .then(setTeams)
        .catch(() => setTeams([]));

      setForm(
        tool
          ? {
              code: tool.code || '',
              nombre: tool.nombre || '',
              descripcion: tool.descripcion || '',
              requiere_mantenimiento: Boolean(tool.requiere_mantenimiento),
              fecha_ultimo_mantenimiento: toDateInput(tool.fecha_ultimo_mantenimiento),
              precio_unitario: tool.precio_unitario ?? '',
              ubicacion: tool.ubicacion || 'oficina',
              equipo_id: tool.equipo_id ?? '',
            }
          : EMPTY,
      );
      setError('');
    }
  }, [open, tool]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  /**
   * When ubicacion changes, clear equipo_id if switching to "oficina".
   */
  const handleUbicacionChange = (e) => {
    const val = e.target.value;
    setForm((f) => ({
      ...f,
      ubicacion: val,
      ...(val === 'oficina' ? { equipo_id: '' } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        requiere_mantenimiento: form.requiere_mantenimiento ? 1 : 0,
        fecha_ultimo_mantenimiento: form.fecha_ultimo_mantenimiento || null,
        precio_unitario: form.precio_unitario !== '' ? Number(form.precio_unitario) : null,
        equipo_id: form.ubicacion === 'asignada' && form.equipo_id ? Number(form.equipo_id) : null,
      };

      if (tool) await updateTool(tool.id, payload);
      else await createTool(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const isAsignada = form.ubicacion === 'asignada';

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title={tool ? 'Editar herramienta' : 'Nueva herramienta'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {error && (
            <Grid size={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Código"
              value={form.code}
              onChange={set('code')}
              fullWidth
              inputProps={{ maxLength: 50 }}
              placeholder="Ej: ASP-01"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label="Nombre"
              value={form.nombre}
              onChange={set('nombre')}
              required
              fullWidth
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label="Descripción"
              value={form.descripcion}
              onChange={set('descripcion')}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Precio unitario"
              type="number"
              value={form.precio_unitario}
              onChange={set('precio_unitario')}
              fullWidth
              inputProps={{ min: 0, step: '0.01' }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Último mantenimiento"
              type="date"
              value={form.fecha_ultimo_mantenimiento}
              onChange={set('fecha_ultimo_mantenimiento')}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          <Grid size={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.requiere_mantenimiento}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, requiere_mantenimiento: e.target.checked }))
                  }
                />
              }
              label="Requiere mantenimiento"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Ubicación"
              value={form.ubicacion}
              onChange={handleUbicacionChange}
              fullWidth
            >
              {UBICACIONES.map((u) => (
                <MenuItem key={u.value} value={u.value}>
                  {u.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Equipo asignado"
              value={form.equipo_id}
              onChange={set('equipo_id')}
              fullWidth
              required={isAsignada}
              disabled={!isAsignada}
              helperText={isAsignada ? 'Requerido para ubicación asignada' : ''}
            >
              <MenuItem value="">— Sin asignar —</MenuItem>
              {teams
                .filter((t) => t.activo)
                .map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.numero}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
        </Grid>

        <DialogActions sx={{ px: 0, pt: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </FormModal>
  );
}
