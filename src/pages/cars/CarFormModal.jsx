/**
 * Modal form for creating / editing a car.
 * Fields map to the `cars` DB table: matricula, tipo, marca, modelo, version,
 * comentarios, caracteristicas, proximo_mantenimiento_fecha, fecha_rego,
 * seguro_info, equipo_id.
 * "version" is displayed to the user as "Año".
 */
import { useState, useEffect } from 'react';
import { DialogActions, Button, TextField, MenuItem, Grid, Alert } from '@mui/material';
import FormModal from '../../components/ui/FormModal';
import { createCar, updateCar } from '../../services/cars.service';
import { getTeams } from '../../services/teams.service';

const TIPOS = ['Sedan', 'SUV', 'Van', 'Ute', 'Truck', 'Otro'];

const EMPTY = {
  matricula: '',
  tipo: '',
  marca: '',
  modelo: '',
  version: '',
  comentarios: '',
  caracteristicas: '',
  proximo_mantenimiento_fecha: '',
  fecha_rego: '',
  seguro_info: '',
  equipo_id: '',
};

/**
 * Normalises a date value coming from the API (ISO or date string) to YYYY-MM-DD
 * for use in <input type="date" />.
 * @param {string|null} val - Raw date value.
 * @returns {string} Formatted date or empty string.
 */
const toDateInput = (val) => {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

export default function CarFormModal({ open, onClose, car, onSaved }) {
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
        car
          ? {
              matricula: car.matricula || '',
              tipo: car.tipo || '',
              marca: car.marca || '',
              modelo: car.modelo || '',
              version: car.version || '',
              comentarios: car.comentarios || '',
              caracteristicas: car.caracteristicas || '',
              proximo_mantenimiento_fecha: toDateInput(car.proximo_mantenimiento_fecha),
              fecha_rego: toDateInput(car.fecha_rego),
              seguro_info: car.seguro_info || '',
              equipo_id: car.equipo_id ?? '',
            }
          : EMPTY,
      );
      setError('');
    }
  }, [open, car]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        equipo_id: form.equipo_id || null,
        proximo_mantenimiento_fecha: form.proximo_mantenimiento_fecha || null,
        fecha_rego: form.fecha_rego || null,
      };

      if (car) await updateCar(car.id, payload);
      else await createCar(payload);
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
      title={car ? 'Editar vehículo' : 'Nuevo vehículo'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {error && (
            <Grid size={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}

          {/* Row 1: Matrícula + Tipo */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Matrícula"
              value={form.matricula}
              onChange={set('matricula')}
              required
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Tipo"
              value={form.tipo}
              onChange={set('tipo')}
              fullWidth
            >
              <MenuItem value="">— Sin tipo —</MenuItem>
              {TIPOS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Row 2: Marca + Modelo */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Marca" value={form.marca} onChange={set('marca')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Modelo" value={form.modelo} onChange={set('modelo')} fullWidth />
          </Grid>

          {/* Row 3: Año (version) + Equipo */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Año"
              type="number"
              value={form.version}
              onChange={set('version')}
              fullWidth
              inputProps={{ min: 1900, max: 2099 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Equipo asignado"
              value={form.equipo_id}
              onChange={set('equipo_id')}
              fullWidth
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

          {/* Row 4: Próximo mantenimiento + Fecha Rego */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Próximo mantenimiento"
              type="date"
              value={form.proximo_mantenimiento_fecha}
              onChange={set('proximo_mantenimiento_fecha')}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Fecha Rego"
              type="date"
              value={form.fecha_rego}
              onChange={set('fecha_rego')}
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          {/* Row 5: Seguro */}
          <Grid size={12}>
            <TextField
              label="Información de seguro"
              value={form.seguro_info}
              onChange={set('seguro_info')}
              fullWidth
            />
          </Grid>

          {/* Row 6: Características */}
          <Grid size={12}>
            <TextField
              label="Características"
              value={form.caracteristicas}
              onChange={set('caracteristicas')}
              fullWidth
              multiline
              minRows={2}
            />
          </Grid>

          {/* Row 7: Comentarios */}
          <Grid size={12}>
            <TextField
              label="Comentarios"
              value={form.comentarios}
              onChange={set('comentarios')}
              fullWidth
              multiline
              minRows={2}
            />
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
