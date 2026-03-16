import { useState, useEffect } from 'react';
import { DialogActions, Button, TextField, MenuItem, Grid, Alert } from '@mui/material';
import FormModal from '../../components/ui/FormModal';
import { generateReport } from '../../services/reports.service';
import { getUsers } from '../../services/users.service';

const EMPTY = { fecha_inicio: '', fecha_fin: '', user_id: '' };

export default function GenerateReportModal({ open, onClose, onGenerated }) {
  const [form, setForm] = useState(EMPTY);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setError('');
      getUsers().then(u => setUsers(u.filter(x => x.activo && x.rol === 'cleaner'))).catch(() => {});
    }
  }, [open]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { fecha_inicio: form.fecha_inicio, fecha_fin: form.fecha_fin };
      if (form.user_id) payload.user_id = form.user_id;
      await generateReport(payload);
      onGenerated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar reporte');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal open={open} onClose={onClose} title="Generar reporte">
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
            <TextField select label="Limpiador (opcional)" value={form.user_id} onChange={set('user_id')} fullWidth>
              <MenuItem value="">Todos</MenuItem>
              {users.map(u => <MenuItem key={u.id} value={u.id}>{u.nombre}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
        <DialogActions sx={{ px: 0, pt: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Generando…' : 'Generar'}</Button>
        </DialogActions>
      </form>
    </FormModal>
  );
}
