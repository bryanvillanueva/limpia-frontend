import { useState, useEffect } from 'react';
import { DialogActions, Button, TextField, Grid, Alert } from '@mui/material';
import FormModal from '../../components/ui/FormModal';
import { createVacation } from '../../services/vacations.service';

const EMPTY = { fecha_inicio: '', fecha_fin: '', motivo: '' };

export default function VacationRequestModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) { setForm(EMPTY); setError(''); } }, [open]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
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
            <TextField label="Fecha inicio" type="date" value={form.fecha_inicio} onChange={set('fecha_inicio')} required fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Fecha fin" type="date" value={form.fecha_fin} onChange={set('fecha_fin')} required fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          </Grid>
          <Grid size={12}>
            <TextField label="Motivo (opcional)" value={form.motivo} onChange={set('motivo')} fullWidth multiline rows={2} />
          </Grid>
        </Grid>
        <DialogActions sx={{ px: 0, pt: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Enviando…' : 'Solicitar'}</Button>
        </DialogActions>
      </form>
    </FormModal>
  );
}
