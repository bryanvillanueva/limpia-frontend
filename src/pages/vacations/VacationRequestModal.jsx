import { useState, useEffect, useMemo } from 'react';
import { DialogActions, Button, TextField, Grid, Alert, Box, Typography, alpha } from '@mui/material';
import { BeachAccess } from '@mui/icons-material';
import FormModal from '../../components/ui/FormModal';
import { createVacation } from '../../services/vacations.service';

const EMPTY = { fecha_inicio: '', fecha_fin: '', motivo: '' };

function toDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const fmt = (d) => d.toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });

export default function VacationRequestModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setForm(EMPTY); setError(''); } }, [open]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Summary of the requested range, or a validation message when the dates don't make sense
  const range = useMemo(() => {
    if (!form.fecha_inicio || !form.fecha_fin) return null;
    const start = toDate(form.fecha_inicio);
    const end = toDate(form.fecha_fin);
    if (end < start) return { invalid: true };
    const days = Math.round((end - start) / 86400000) + 1;
    return { days, start, end };
  }, [form.fecha_inicio, form.fecha_fin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (range?.invalid) { setError('La fecha de fin no puede ser anterior a la de inicio'); return; }
    setSaving(true);
    setError('');
    try {
      await createVacation(form);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al enviar solicitud');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal open={open} onClose={onClose} title="Solicitar vacaciones">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {error && <Grid size={12}><Alert severity="error">{error}</Alert></Grid>}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Fecha inicio" type="date" value={form.fecha_inicio} onChange={set('fecha_inicio')}
              required fullWidth
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: todayStr } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Fecha fin" type="date" value={form.fecha_fin} onChange={set('fecha_fin')}
              required fullWidth error={!!range?.invalid}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: form.fecha_inicio || todayStr } }}
            />
          </Grid>

          {range && !range.invalid && (
            <Grid size={12}>
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                }}
              >
                <BeachAccess color="primary" />
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    {range.days} {range.days === 1 ? 'día' : 'días'} de vacaciones
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'none', letterSpacing: 0 }}>
                    Del {fmt(range.start)} al {fmt(range.end)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}

          <Grid size={12}>
            <TextField label="Motivo (opcional)" value={form.motivo} onChange={set('motivo')} fullWidth multiline rows={2} />
          </Grid>
        </Grid>
        <DialogActions sx={{ px: 0, pt: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving || !!range?.invalid}>{saving ? 'Enviando…' : 'Solicitar'}</Button>
        </DialogActions>
      </form>
    </FormModal>
  );
}
