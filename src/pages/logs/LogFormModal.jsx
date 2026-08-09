import { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, ToggleButton, ToggleButtonGroup, TextField,
  Typography, Box, Alert, Autocomplete, InputAdornment,
} from '@mui/material';
import { Delete, Search } from '@mui/icons-material';
import { createLog, updateLog, deleteLog } from '../../services/logs.service';
import { searchSites } from '../../services/sites.service';

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDateLocal(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const DAY_NAMES_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/**
 * Modal dialog for creating, editing, or deleting a daily site log.
 *
 * @param {boolean}  open           - Dialog visibility.
 * @param {Function} onClose        - Close handler.
 * @param {Object}   [site]         - Pre-selected site ({ site_id, direccion_linea1, horas_por_trabajador, hace_bins, pago_bins }).
 * @param {string}   [fecha]        - Pre-filled date (YYYY-MM-DD).
 * @param {Object}   [plannerEntry] - Planner item for this cell ({ entry_type }).
 * @param {Array}    [teamSites]    - All available sites for manual selection.
 * @param {Object}   [existingLog]  - If provided, modal opens in edit mode with this log's data.
 * @param {Function} onSaved        - Called after successful save or delete.
 */
export default function LogFormModal({ open, onClose, site, fecha, plannerEntry, teamSites, existingLog, onSaved }) {
  const isEdit = !!existingLog;

  const [selectedSite, setSelectedSite] = useState(null);
  const [siteInputValue, setSiteInputValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [logDate, setLogDate] = useState('');
  const [entryType, setEntryType] = useState('SERVICE');
  const [customValue, setCustomValue] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (existingLog) {
        setSelectedSite(site || null);
        setLogDate(existingLog.fecha?.slice(0, 10) || '');
        setEntryType(existingLog.entry_type || 'SERVICE');
        setCustomValue(existingLog.entry_type === 'CUSTOM' ? String(existingLog.display_value ?? '') : '');
        setObservaciones(existingLog.observaciones || '');
      } else {
        setSelectedSite(site || null);
        setLogDate(fecha || formatDate(new Date()));
        setEntryType(plannerEntry?.entry_type || 'SERVICE');
        setCustomValue('');
        setObservaciones('');
      }
      setError('');
      setConfirmDelete(false);
      setSiteInputValue('');
      setSearchResults([]);
    }
  }, [open, site, fecha, plannerEntry, existingLog]);

  // Debounced search across all active sites (for occasional sites not assigned to the team)
  useEffect(() => {
    const q = siteInputValue.trim();
    if (q.length < 2) { setSearchResults([]); setSearching(false); return; }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      searchSites(q)
        .then((results) => { if (!cancelled) setSearchResults(results || []); })
        .catch(() => { if (!cancelled) setSearchResults([]); })
        .finally(() => { if (!cancelled) setSearching(false); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [siteInputValue]);

  // Team sites (with rates) + search results not already in the team list (occasional sites)
  const siteOptions = useMemo(() => {
    const teamIds = new Set((teamSites || []).map((t) => t.site_id ?? t.id));
    const extra = searchResults.filter((r) => !teamIds.has(r.id));
    return [...(teamSites || []), ...extra];
  }, [teamSites, searchResults]);

  const effectiveSite = selectedSite;
  const isTeamSite = (s) => !!s && (teamSites || []).some((t) => (t.site_id ?? t.id) === (s.site_id ?? s.id));
  const isOccasionalSite = !!effectiveSite && !isTeamSite(effectiveSite);
  const canBins = effectiveSite?.hace_bins === 1;
  const isCustom = entryType === 'CUSTOM';

  const previewValue = useMemo(() => {
    if (!effectiveSite || isCustom) return null;
    if (entryType === 'SERVICE') {
      const h = effectiveSite.horas_por_trabajador;
      return h != null ? `${h}h por trabajador` : 'Sin horas asignadas';
    }
    if (entryType === 'BINS') {
      const p = effectiveSite.pago_bins;
      return p != null ? `$${Number(p).toFixed(2)} pago bins` : 'Sin pago bins asignado';
    }
    return null;
  }, [effectiveSite, entryType, isCustom]);

  const dateLabel = useMemo(() => {
    if (!logDate) return '';
    const dt = parseDateLocal(logDate);
    const dayName = DAY_NAMES_ES[dt.getDay()];
    return `${dayName} ${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
  }, [logDate]);

  const handleSubmit = async () => {
    if (!effectiveSite) { setError('Seleccioná un sitio'); return; }
    if (isCustom && (customValue === '' || isNaN(Number(customValue)) || Number(customValue) < 0)) {
      setError('Ingresá un valor numérico >= 0');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        site_id: effectiveSite.site_id ?? effectiveSite.id,
        fecha: logDate,
        entry_type: entryType,
        observaciones: observaciones.trim() || undefined,
      };
      if (isCustom) payload.display_value = Number(customValue);

      if (isEdit) {
        await updateLog(existingLog.id, payload);
      } else {
        await createLog(payload);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setError('');
    try {
      await deleteLog(existingLog.id);
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  const siteLabel = (s) =>
    [s.direccion_linea1 || s.nombre, s.suburb].filter(Boolean).join(', ') || `Sitio ${s.site_id ?? s.id}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {isEdit ? 'Editar log' : 'Registrar log'}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

        {/* Site selector — only when no site pre-selected and creating */}
        {!site && !isEdit && teamSites && (
          <Autocomplete
            autoFocus
            openOnFocus
            value={selectedSite}
            onChange={(_, val) => {
              setSelectedSite(val);
              if (val && !isTeamSite(val)) {
                setEntryType('CUSTOM');
              } else if (val && !val.hace_bins && entryType === 'BINS') {
                setEntryType('SERVICE');
              }
            }}
            onInputChange={(_, val) => setSiteInputValue(val)}
            options={siteOptions}
            getOptionLabel={siteLabel}
            isOptionEqualToValue={(opt, val) => (opt.site_id ?? opt.id) === (val.site_id ?? val.id)}
            loading={searching}
            loadingText="Buscando..."
            renderInput={(params) => (
              <TextField
                {...params}
                label="Buscar sitio"
                placeholder="Escribe una dirección o suburbio..."
                size="small"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Search fontSize="small" color="action" />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
            noOptionsText={siteInputValue.trim().length < 2 ? 'Escribe al menos 2 letras para buscar' : 'No hay sitios disponibles'}
          />
        )}

        {/* Occasional site hint — site is not assigned to the user's team */}
        {isOccasionalSite && (
          <Alert severity="info" sx={{ mt: -1 }}>
            Este sitio no está asignado a tu equipo. Ingresá el valor a cobrar manualmente en "Otro".
          </Alert>
        )}

        {/* Site name (when pre-selected or editing) */}
        {(site || isEdit) && (
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">Sitio</Typography>
            <Typography variant="body2" fontWeight={600}>
              {site ? siteLabel(site) : (existingLog?.sitio || `Sitio ${existingLog?.site_id}`)}
            </Typography>
          </Box>
        )}

        {/* Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Fecha</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
              {dateLabel}
            </Typography>
          </Box>
          <TextField
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            size="small"
            sx={{ width: 160 }}
          />
        </Box>

        {/* Entry type */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Tipo de entrada
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={entryType}
            onChange={(_, val) => { if (val) { setEntryType(val); if (val !== 'CUSTOM') setCustomValue(''); } }}
            size="small"
            fullWidth
          >
            <ToggleButton value="SERVICE" disabled={isOccasionalSite} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Service{isOccasionalSite ? ' (N/A)' : ''}
            </ToggleButton>
            <ToggleButton value="BINS" disabled={!canBins || isOccasionalSite} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Bins{(!canBins || isOccasionalSite) && effectiveSite ? ' (N/A)' : ''}
            </ToggleButton>
            <ToggleButton value="CUSTOM" sx={{ textTransform: 'none', fontWeight: 600 }}>Otro</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Value preview */}
        {previewValue && (
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">Valor estimado</Typography>
            <Typography variant="body2" fontWeight={600}>{previewValue}</Typography>
          </Box>
        )}

        {/* Custom value */}
        {isCustom && (
          <TextField
            label="Valor personalizado"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            type="number"
            size="small"
            required
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
            fullWidth
          />
        )}

        {/* Observaciones */}
        <TextField
          label="Observaciones (opcional)"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          multiline
          rows={2}
          size="small"
          fullWidth
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: isEdit ? 'space-between' : 'flex-end' }}>
        {isEdit && (
          <Button
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            disabled={deleting || saving}
          >
            {deleting ? 'Eliminando...' : confirmDelete ? 'Confirmar eliminar' : 'Eliminar'}
          </Button>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving || deleting}>
            {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Registrar'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
