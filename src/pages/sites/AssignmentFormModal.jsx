import { useState, useEffect } from 'react';
import {
  DialogActions, Button, TextField, MenuItem, Grid, Alert,
  Switch, FormControlLabel, Typography,
} from '@mui/material';
import FormModal from '../../components/ui/FormModal';
import { assignTeamToSite } from '../../services/sites.service';

const FRECUENCIAS = [
  'Diariamente',
  'Semanalmente (un dia/semana)',
  'Semanalmente (dos dias/semana)',
  'Semanalmente (tres dias/semana)',
  'Quincenalmente (un dia/semana)',
  'Mensualmente (un dia/semana)',
  'Casual',
];

const EMPTY = {
  team_id: '',
  frecuencia: '',
  horas_por_trabajador: '',
  hace_bins: false,
  pago_bins: '',
  fecha_asignacion: '',
};

export default function AssignmentFormModal({ open, onClose, siteId, teams, assignment, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(assignment);

  useEffect(() => {
    if (open) {
      setForm(assignment
        ? {
            team_id: assignment.team_id,
            frecuencia: assignment.frecuencia || '',
            horas_por_trabajador: assignment.horas_por_trabajador ?? '',
            hace_bins: Boolean(assignment.hace_bins),
            pago_bins: assignment.pago_bins ?? '',
            fecha_asignacion: assignment.fecha_asignacion ? assignment.fecha_asignacion.slice(0, 10) : '',
          }
        : EMPTY
      );
      setError('');
    }
  }, [open, assignment]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await assignTeamToSite(siteId, {
        team_id: form.team_id,
        frecuencia: form.frecuencia || null,
        horas_por_trabajador: form.horas_por_trabajador !== '' ? Number(form.horas_por_trabajador) : null,
        hace_bins: form.hace_bins ? 1 : 0,
        pago_bins: form.pago_bins !== '' ? Number(form.pago_bins) : null,
        fecha_asignacion: form.fecha_asignacion || null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar asignación');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal open={open} onClose={onClose} title={isEdit ? 'Editar asignación' : 'Nueva asignación'}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {error && <Grid size={12}><Alert severity="error">{error}</Alert></Grid>}

          <Grid size={12}>
            <TextField
              select
              label="Equipo"
              value={form.team_id}
              onChange={set('team_id')}
              required
              fullWidth
              disabled={isEdit}
            >
              {teams.length === 0 ? (
                <MenuItem disabled>No hay equipos disponibles</MenuItem>
              ) : (
                teams.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.numero}
                    {t.members?.length > 0 && (
                      <Typography
                        component="span"
                        variant="caption"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({t.members.map(m => m.nombre).join(', ')})
                      </Typography>
                    )}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>

          <Grid size={12}>
            <TextField
              select
              label="Frecuencia"
              value={form.frecuencia}
              onChange={set('frecuencia')}
              required
              fullWidth
            >
              {FRECUENCIAS.map(f => (
                <MenuItem key={f} value={f}>{f}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Horas por trabajador"
              type="number"
              value={form.horas_por_trabajador}
              onChange={set('horas_por_trabajador')}
              fullWidth
              slotProps={{ htmlInput: { min: 0, step: 'any' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Fecha de asignación"
              type="date"
              value={form.fecha_asignacion}
              onChange={set('fecha_asignacion')}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.hace_bins}
                  onChange={(e) => setForm(f => ({ ...f, hace_bins: e.target.checked }))}
                />
              }
              label="Hace bins"
            />
          </Grid>

          {form.hace_bins && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Pago bins"
                type="number"
                value={form.pago_bins}
                onChange={set('pago_bins')}
                fullWidth
                slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
              />
            </Grid>
          )}
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
