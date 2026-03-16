import { useState, useEffect } from 'react';
import { DialogActions, Button, TextField, MenuItem, Grid, Alert } from '@mui/material';
import FormModal from '../../components/ui/FormModal';
import { createComplaint, updateComplaint } from '../../services/complaints.service';

const TIPOS = ['cliente', 'empleado', 'sitio', 'otro'];
const ESTADOS = ['abierto', 'en_proceso', 'cerrado'];
const EMPTY = { descripcion: '', tipo: 'cliente', site_id: '', estado: 'abierto', resolucion: '' };

export default function ComplaintFormModal({ open, onClose, complaint, sites, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = !!complaint;

  useEffect(() => {
    if (open) {
      setForm(complaint
        ? { descripcion: complaint.descripcion, tipo: complaint.tipo || 'cliente', site_id: complaint.site_id || '', estado: complaint.estado, resolucion: complaint.resolucion || '' }
        : EMPTY
      );
      setError('');
    }
  }, [open, complaint]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, site_id: form.site_id || null };
      if (isEdit) await updateComplaint(complaint.id, payload);
      else await createComplaint(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal open={open} onClose={onClose} title={isEdit ? 'Editar queja' : 'Nueva queja'}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {error && <Grid size={12}><Alert severity="error">{error}</Alert></Grid>}
          <Grid size={12}>
            <TextField label="Descripción" value={form.descripcion} onChange={set('descripcion')} required fullWidth multiline rows={3} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Tipo" value={form.tipo} onChange={set('tipo')} fullWidth>
              {TIPOS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select label="Sitio (opcional)" value={form.site_id} onChange={set('site_id')} fullWidth>
              <MenuItem value="">Sin sitio</MenuItem>
              {(sites || []).map(s => <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>)}
            </TextField>
          </Grid>
          {isEdit && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField select label="Estado" value={form.estado} onChange={set('estado')} fullWidth>
                  {ESTADOS.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField label="Resolución" value={form.resolucion} onChange={set('resolucion')} fullWidth multiline rows={2} />
              </Grid>
            </>
          )}
        </Grid>
        <DialogActions sx={{ px: 0, pt: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
        </DialogActions>
      </form>
    </FormModal>
  );
}
