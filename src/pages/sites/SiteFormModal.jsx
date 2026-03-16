/**
 * SiteFormModal — Create / edit a site with all fields from the `sites` table.
 * Includes a multi-team assignment section: a site can be assigned to multiple
 * teams simultaneously. Users can add, edit, or remove assignments.
 *
 * @param {boolean} open
 * @param {function} onClose
 * @param {object|null} site - Null for create, site row for edit.
 * @param {Array} clients - Client list for the dropdown.
 * @param {Array} teams - Active teams list for the assignment dropdown.
 * @param {function} onSaved - Called after a successful save.
 */
import { useState, useEffect } from 'react';
import {
  DialogActions, Button, TextField, MenuItem, Grid, Alert,
  Switch, FormControlLabel, Typography, Divider, Box, IconButton,
  Paper, Chip,
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import FormModal from '../../components/ui/FormModal';
import {
  createSite, updateSite, assignTeamToSite,
  removeTeamFromSite, getSiteAssignments,
} from '../../services/sites.service';

const FRECUENCIAS = [
  'Diariamente',
  'Semanalmente (un dia/semana)',
  'Semanalmente (dos dias/semana)',
  'Semanalmente (tres dias/semana)',
  'Quincenalmente (un dia/semana)',
  'Mensualmente (un dia/semana)',
  'Casual',
];

const EMPTY_SITE = {
  direccion_linea1: '',
  direccion_linea2: '',
  suburb: '',
  state: '',
  postcode: '',
  country: 'Australia',
  cliente_id: '',
  contrato: '',
  finanzas: '',
  activo: true,
  latitud: '',
  longitud: '',
};

const makeEmptyAssignment = () => ({
  team_id: '',
  frecuencia: '',
  horas_por_trabajador: '',
  hace_bins: false,
  pago_bins: '',
  fecha_asignacion: '',
});

export default function SiteFormModal({ open, onClose, site, clients, teams = [], onSaved }) {
  const [form, setForm] = useState(EMPTY_SITE);
  const [assignments, setAssignments] = useState([]);
  const [originalTeamIds, setOriginalTeamIds] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(site);

  useEffect(() => {
    if (!open) return;

    if (site) {
      setForm({
        direccion_linea1: site.direccion_linea1 || '',
        direccion_linea2: site.direccion_linea2 || '',
        suburb: site.suburb || '',
        state: site.state || '',
        postcode: site.postcode || '',
        country: site.country || 'Australia',
        cliente_id: site.cliente_id || '',
        contrato: site.contrato || '',
        finanzas: site.finanzas || '',
        activo: Boolean(site.activo),
        latitud: site.latitud ?? '',
        longitud: site.longitud ?? '',
      });

      getSiteAssignments(site.id)
        .then((fetched) => {
          const active = fetched.filter((a) => a.activo !== 0 && a.activo !== false);
          const mapped = active.map((a) => ({
            team_id: a.team_id,
            frecuencia: a.frecuencia || '',
            horas_por_trabajador: a.horas_por_trabajador ?? '',
            hace_bins: Boolean(a.hace_bins),
            pago_bins: a.pago_bins ?? '',
            fecha_asignacion: a.fecha_asignacion ? a.fecha_asignacion.slice(0, 10) : '',
          }));
          setAssignments(mapped);
          setOriginalTeamIds(active.map((a) => a.team_id));
        })
        .catch(() => {
          setAssignments([]);
          setOriginalTeamIds([]);
        });
    } else {
      setForm(EMPTY_SITE);
      setAssignments([]);
      setOriginalTeamIds([]);
    }
    setError('');
  }, [open, site]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const updateAssignment = (idx, field, value) => {
    setAssignments((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
  };

  const removeAssignment = (idx) => {
    setAssignments((prev) => prev.filter((_, i) => i !== idx));
  };

  const addAssignment = () => {
    setAssignments((prev) => [...prev, makeEmptyAssignment()]);
  };

  /** Team IDs already used in the assignments list, to filter dropdowns. */
  const usedTeamIds = assignments.map((a) => a.team_id).filter(Boolean);

  const buildAssignPayload = (a) => ({
    team_id: a.team_id,
    frecuencia: a.frecuencia || null,
    horas_por_trabajador: a.horas_por_trabajador !== '' ? Number(a.horas_por_trabajador) : null,
    hace_bins: a.hace_bins ? 1 : 0,
    pago_bins: a.pago_bins !== '' ? Number(a.pago_bins) : null,
    fecha_asignacion: a.fecha_asignacion || null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasIncomplete = assignments.some((a) => !a.team_id);
    if (hasIncomplete) {
      setError('Selecciona un equipo para cada asignación o elimina las filas vacías.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const sitePayload = {
        direccion_linea1: form.direccion_linea1,
        direccion_linea2: form.direccion_linea2 || null,
        suburb: form.suburb || null,
        state: form.state || null,
        postcode: form.postcode || null,
        country: form.country || null,
        cliente_id: form.cliente_id,
        contrato: form.contrato || null,
        finanzas: form.finanzas || null,
        activo: form.activo ? 1 : 0,
        latitud: form.latitud !== '' ? Number(form.latitud) : null,
        longitud: form.longitud !== '' ? Number(form.longitud) : null,
      };

      let savedSite;
      if (isEdit) {
        savedSite = await updateSite(site.id, sitePayload);
      } else {
        savedSite = await createSite(sitePayload);
      }

      const siteId = savedSite?.id || site?.id;
      const currentTeamIds = assignments.map((a) => a.team_id);

      const toRemove = originalTeamIds.filter((tid) => !currentTeamIds.includes(tid));
      const toAddOrUpdate = assignments.filter((a) => a.team_id);

      await Promise.all(toRemove.map((tid) => removeTeamFromSite(siteId, tid)));
      await Promise.all(toAddOrUpdate.map((a) => assignTeamToSite(siteId, buildAssignPayload(a))));

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar sitio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal open={open} onClose={onClose} title={isEdit ? 'Editar sitio' : 'Nuevo sitio'} maxWidth="md">
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {error && <Grid size={12}><Alert severity="error">{error}</Alert></Grid>}

          {/* ── Address ── */}
          <Grid size={12}>
            <TextField label="Dirección línea 1" value={form.direccion_linea1} onChange={set('direccion_linea1')} required fullWidth />
          </Grid>
          <Grid size={12}>
            <TextField label="Dirección línea 2" value={form.direccion_linea2} onChange={set('direccion_linea2')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Suburb" value={form.suburb} onChange={set('suburb')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="State" value={form.state} onChange={set('state')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Postcode" value={form.postcode} onChange={set('postcode')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="País" value={form.country} onChange={set('country')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select label="Cliente" value={form.cliente_id} onChange={set('cliente_id')} required fullWidth>
              {clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* ── Details ── */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Contrato" value={form.contrato} onChange={set('contrato')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Finanzas" value={form.finanzas} onChange={set('finanzas')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Latitud" type="number" value={form.latitud} onChange={set('latitud')} fullWidth slotProps={{ htmlInput: { step: 'any' } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Longitud" type="number" value={form.longitud} onChange={set('longitud')} fullWidth slotProps={{ htmlInput: { step: 'any' } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch checked={form.activo} onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))} />}
              label="Activo"
            />
          </Grid>

          {/* ── Team assignments ── */}
          <Grid size={12}>
            <Divider sx={{ mt: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb: 0.5 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Equipos asignados
                  {assignments.length > 0 && (
                    <Chip label={assignments.length} size="small" sx={{ ml: 1, height: 20, fontSize: '0.75rem' }} />
                  )}
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<Add />}
                onClick={addAssignment}
                disabled={assignments.some((a) => !a.team_id)}
              >
                Agregar equipo
              </Button>
            </Box>
          </Grid>

          {assignments.length === 0 && (
            <Grid size={12}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'action.hover', borderStyle: 'dashed' }}>
                <Typography variant="body2" color="text.secondary">
                  Sin equipos asignados. Usa "Agregar equipo" para asignar uno.
                </Typography>
              </Paper>
            </Grid>
          )}

          {assignments.map((a, idx) => {
            const availableTeams = teams.filter(
              (t) => t.id === a.team_id || !usedTeamIds.includes(t.id),
            );
            const teamLabel = teams.find((t) => t.id === a.team_id)?.numero;

            return (
              <Grid size={12} key={idx}>
                <Paper variant="outlined" sx={{ p: 2, position: 'relative' }}>
                  <IconButton
                    size="small"
                    onClick={() => removeAssignment(idx)}
                    sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary' }}
                    title="Eliminar asignación"
                  >
                    <Close fontSize="small" />
                  </IconButton>

                  {teamLabel && (
                    <Typography variant="caption" color="primary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                      Equipo {teamLabel}
                    </Typography>
                  )}

                  <Grid container spacing={2}>
                    <Grid size={12}>
                      <TextField
                        select
                        label="Equipo"
                        value={a.team_id}
                        onChange={(e) => updateAssignment(idx, 'team_id', e.target.value)}
                        required
                        fullWidth
                        size="small"
                      >
                        {availableTeams.map((t) => (
                          <MenuItem key={t.id} value={t.id}>
                            {t.numero}
                            {t.members?.length > 0 && (
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                ({t.members.map((m) => m.nombre).join(', ')})
                              </Typography>
                            )}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    {a.team_id && (
                      <>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            select
                            label="Frecuencia"
                            value={a.frecuencia}
                            onChange={(e) => updateAssignment(idx, 'frecuencia', e.target.value)}
                            fullWidth
                            size="small"
                          >
                            <MenuItem value="">—</MenuItem>
                            {FRECUENCIAS.map((f) => (
                              <MenuItem key={f} value={f}>{f}</MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="Horas por trabajador"
                            type="number"
                            value={a.horas_por_trabajador}
                            onChange={(e) => updateAssignment(idx, 'horas_por_trabajador', e.target.value)}
                            fullWidth
                            size="small"
                            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            label="Fecha asignación"
                            type="date"
                            value={a.fecha_asignacion}
                            onChange={(e) => updateAssignment(idx, 'fecha_asignacion', e.target.value)}
                            fullWidth
                            size="small"
                            slotProps={{ inputLabel: { shrink: true } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={a.hace_bins}
                                onChange={(e) => updateAssignment(idx, 'hace_bins', e.target.checked)}
                                size="small"
                              />
                            }
                            label="Hace bins"
                          />
                        </Grid>
                        {a.hace_bins && (
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              label="Pago bins"
                              type="number"
                              value={a.pago_bins}
                              onChange={(e) => updateAssignment(idx, 'pago_bins', e.target.value)}
                              fullWidth
                              size="small"
                              slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                            />
                          </Grid>
                        )}
                      </>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            );
          })}
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
