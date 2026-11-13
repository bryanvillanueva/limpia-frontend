import { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, ToggleButton, ToggleButtonGroup, TextField,
  Typography, Box, Alert, Autocomplete, useMediaQuery, useTheme, alpha,
} from '@mui/material';
import { Delete, AddLocationAlt } from '@mui/icons-material';
import { createLog, updateLog, deleteLog } from '../../services/logs.service';
import { searchSites, createQuickSite } from '../../services/sites.service';
import DateField from '../../components/ui/DateField';

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDateLocal(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const DAY_NAMES_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const trimHours = (n) => Number(n).toFixed(2).replace(/\.?0+$/, '') || '0';

const siteLabel = (s) =>
  [s.direccion_linea1 || s.nombre, s.suburb].filter(Boolean).join(', ') || `Sitio ${s.site_id ?? s.id}`;

/**
 * Modal dialog for creating, editing, or deleting a daily site log.
 *
 * Choosing the site (when none is pre-selected):
 *  1. Sites assigned to the team (with their hours / bins rates).
 *  2. Any other registered site, found through the server search. These have no rate for the team,
 *     so the log is entered as "Otro" with the value typed by hand.
 *  3. A site that is not registered at all: "Agregar «texto» como sitio nuevo" asks for the address,
 *     creates it as a one-off site (an admin reviews it later) and logs against it as "Otro".
 *
 * @param {boolean}  open           - Dialog visibility.
 * @param {Function} onClose        - Close handler.
 * @param {Object}   [site]         - Pre-selected site ({ site_id, direccion_linea1, horas_por_trabajador, hace_bins, pago_bins }).
 * @param {string}   [fecha]        - Pre-filled date (YYYY-MM-DD).
 * @param {Object}   [plannerEntry] - Planner item for this cell ({ entry_type }).
 * @param {Array}    [teamSites]    - Sites assigned to the team, for manual selection.
 * @param {Object}   [existingLog]  - If provided, modal opens in edit mode with this log's data.
 * @param {Function} onSaved        - Called after successful save or delete.
 */
export default function LogFormModal({ open, onClose, site, fecha, plannerEntry, teamSites, existingLog, onSaved }) {
  const isEdit = !!existingLog;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedSite, setSelectedSite] = useState(null);
  const [logDate, setLogDate] = useState('');
  const [entryType, setEntryType] = useState('SERVICE');
  const [customValue, setCustomValue] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  // Site picker state
  const [siteMode, setSiteMode] = useState('pick'); // 'pick' = search the lists, 'new' = type a new site
  const [siteInput, setSiteInput] = useState('');
  const [remoteSites, setRemoteSites] = useState([]);
  const [searching, setSearching] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newSuburb, setNewSuburb] = useState('');

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
      setSiteMode('pick');
      setSiteInput('');
      setRemoteSites([]);
      setSearching(false);
      setNewAddress('');
      setNewSuburb('');
    }
  }, [open, site, fecha, plannerEntry, existingLog]);

  const pickingSite = !site && !isEdit;

  // Search the rest of the registered sites while the user types (debounced)
  useEffect(() => {
    const q = siteInput.trim();
    if (!open || !pickingSite || siteMode !== 'pick' || q.length < 2) return undefined;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const rows = await searchSites(q);
        if (!cancelled) setRemoteSites(rows);
      } catch {
        if (!cancelled) setRemoteSites([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    // A cancelled search never reaches its finally block, so the spinner is reset here
    return () => { cancelled = true; clearTimeout(timer); setSearching(false); };
  }, [siteInput, open, pickingSite, siteMode]);

  const assignedIds = useMemo(() => new Set((teamSites || []).map((s) => s.site_id ?? s.id)), [teamSites]);

  const siteOptions = useMemo(() => {
    const typed = siteInput.trim();
    const q = typed.toLowerCase();
    const matches = (s) => !q || [s.direccion_linea1, s.suburb].filter(Boolean).join(' ').toLowerCase().includes(q);

    const mine = (teamSites || []).filter(matches);
    const others = q.length >= 2
      ? remoteSites
        .filter((r) => !assignedIds.has(r.id))
        .map((r) => ({
          site_id: r.id, direccion_linea1: r.direccion_linea1, suburb: r.suburb,
          hace_bins: 0, horas_por_trabajador: null, pago_bins: null, unassigned: true,
        }))
      : [];
    const exact = [...mine, ...others].some((o) => siteLabel(o).toLowerCase() === q);
    const create = typed.length >= 5 && !exact ? [{ __create: true, query: typed }] : [];
    return [...mine, ...others, ...create];
  }, [teamSites, remoteSites, siteInput, assignedIds]);

  const isNewSite = pickingSite && siteMode === 'new';
  const effectiveSite = useMemo(
    () => (isNewSite ? { site_id: null, direccion_linea1: newAddress, unassigned: true } : selectedSite),
    [isNewSite, newAddress, selectedSite],
  );

  // A site without a team assignment has no hourly rate or bins pay: the log is always "Otro" with a typed value
  const isUnassigned = !isEdit && !!effectiveSite?.unassigned;
  const effType = isUnassigned ? 'CUSTOM' : entryType;
  // An existing Bins log keeps its type even if the site has no bins rate today
  const canBins = effectiveSite?.hace_bins === 1 || (isEdit && existingLog?.entry_type === 'BINS');
  const isCustom = effType === 'CUSTOM';

  // What the user sees under the type: the value an existing log was registered with, or the site rate for a new one
  const previewValue = useMemo(() => {
    if (isCustom) return null;
    if (isEdit && existingLog && effType === existingLog.entry_type && existingLog.display_value != null) {
      return { label: 'Valor registrado', text: `${trimHours(existingLog.display_value)} h` };
    }
    if (!effectiveSite) return null;
    if (effType === 'SERVICE') {
      const h = effectiveSite.horas_por_trabajador;
      return { label: 'Valor estimado', text: h != null ? `${trimHours(h)} h por trabajador` : 'Sin horas asignadas' };
    }
    if (effType === 'BINS') {
      const p = effectiveSite.pago_bins;
      return { label: 'Valor estimado', text: p != null ? `${trimHours(p)} h por bins` : 'Sin horas de bins asignadas' };
    }
    return null;
  }, [effectiveSite, effType, isCustom, isEdit, existingLog]);

  const dateLabel = useMemo(() => {
    if (!logDate) return '';
    const dt = parseDateLocal(logDate);
    const dayName = DAY_NAMES_ES[dt.getDay()];
    return `${dayName} ${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`;
  }, [logDate]);

  const handleSubmit = async () => {
    if (!effectiveSite) { setError('Seleccioná un sitio'); return; }
    if (isNewSite && newAddress.trim().length < 5) {
      setError('Escribí la dirección del sitio (mínimo 5 caracteres)');
      return;
    }
    if (isCustom && (customValue === '' || isNaN(Number(customValue)) || Number(customValue) < 0)) {
      setError('Ingresá un valor numérico >= 0');
      return;
    }
    setSaving(true);
    setError('');
    try {
      let siteId = effectiveSite.site_id ?? effectiveSite.id;
      if (isNewSite) {
        // If the same address already exists the server returns that site instead of duplicating it
        const created = await createQuickSite({
          direccion_linea1: newAddress.trim(),
          suburb: newSuburb.trim() || undefined,
        });
        siteId = created.id;
      }

      const payload = {
        site_id: siteId,
        fecha: logDate,
        entry_type: effType,
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

  const groupOf = (o) => {
    if (o.__create) return 'Sitio nuevo';
    return o.unassigned ? 'Otros sitios registrados' : 'Sitios de tu equipo';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth fullScreen={fullScreen}>
      <DialogTitle>
        {isEdit ? 'Editar log' : 'Registrar log'}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

        {/* Site picker — only when no site pre-selected and creating */}
        {pickingSite && siteMode === 'pick' && (
          <Autocomplete
            openOnFocus
            value={selectedSite}
            inputValue={siteInput}
            onInputChange={(_, v) => setSiteInput(v)}
            onChange={(_, val) => {
              if (val?.__create) {
                setNewAddress(val.query);
                setNewSuburb('');
                setSelectedSite(null);
                setSiteMode('new');
                return;
              }
              setSelectedSite(val);
              if (val && !val.hace_bins && entryType === 'BINS') setEntryType('SERVICE');
            }}
            options={siteOptions}
            filterOptions={(x) => x}
            groupBy={groupOf}
            getOptionLabel={(o) => (o.__create ? o.query : siteLabel(o))}
            isOptionEqualToValue={(opt, val) => (opt.site_id ?? opt.id) === (val.site_id ?? val.id)}
            loading={searching}
            loadingText="Buscando sitios…"
            noOptionsText="Escribí la dirección del sitio"
            renderOption={(props, option) => {
              const { key, ...rest } = props;
              if (option.__create) {
                return (
                  <Box component="li" key={key} {...rest} sx={{ gap: 1, color: 'primary.main', fontWeight: 600 }}>
                    <AddLocationAlt fontSize="small" />
                    Agregar «{option.query}» como sitio nuevo
                  </Box>
                );
              }
              return <li key={key} {...rest}>{siteLabel(option)}</li>;
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Sitio"
                size="small"
                placeholder="Buscá o escribí la dirección"
                helperText="Si no está en la lista podés agregarlo escribiendo su dirección"
              />
            )}
          />
        )}

        {/* New (unregistered) site typed by hand */}
        {isNewSite && (
          <Box
            sx={{
              p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5,
              border: '1px dashed', borderColor: 'primary.main',
              bgcolor: (t) => alpha(t.palette.primary.main, 0.05),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <AddLocationAlt fontSize="small" color="primary" /> Sitio nuevo
              </Typography>
              <Button
                size="small"
                onClick={() => { setSiteMode('pick'); setSiteInput(newAddress); }}
                sx={{ textTransform: 'none' }}
              >
                Buscar en la lista
              </Button>
            </Box>
            <TextField
              label="Dirección"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              size="small"
              required
              fullWidth
              autoFocus
              slotProps={{ htmlInput: { maxLength: 255 } }}
            />
            <TextField
              label="Suburb / ciudad (opcional)"
              value={newSuburb}
              onChange={(e) => setNewSuburb(e.target.value)}
              size="small"
              fullWidth
              slotProps={{ htmlInput: { maxLength: 100 } }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'none', letterSpacing: 0 }}>
              Se agrega como sitio nuevo y un administrador lo revisará.
            </Typography>
          </Box>
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
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">Fecha</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
              {dateLabel}
            </Typography>
          </Box>
          <DateField
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            size="small"
            sx={{ width: { xs: '100%', sm: 180 } }}
          />
        </Box>

        {/* Entry type */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Tipo de entrada
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={effType}
            onChange={(_, val) => { if (val) { setEntryType(val); if (val !== 'CUSTOM') setCustomValue(''); } }}
            size="small"
            fullWidth
          >
            <ToggleButton value="SERVICE" disabled={isUnassigned} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Service{isUnassigned ? ' (N/A)' : ''}
            </ToggleButton>
            <ToggleButton value="BINS" disabled={isUnassigned || !canBins} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Bins{(!canBins || isUnassigned) && effectiveSite ? ' (N/A)' : ''}
            </ToggleButton>
            <ToggleButton value="CUSTOM" sx={{ textTransform: 'none', fontWeight: 600 }}>Otro</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {isUnassigned && (
          <Alert severity="info" sx={{ py: 0.5 }}>
            Este sitio no está asignado a tu equipo, así que no tiene una tarifa definida. Ingresá vos el valor (horas trabajadas).
          </Alert>
        )}

        {/* Value preview */}
        {previewValue && (
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">{previewValue.label}</Typography>
            <Typography variant="body2" fontWeight={600}>{previewValue.text}</Typography>
          </Box>
        )}

        {/* Custom value */}
        {isCustom && (
          <TextField
            label={isUnassigned ? 'Horas trabajadas' : 'Valor personalizado'}
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            type="number"
            size="small"
            required
            slotProps={{ htmlInput: { min: 0, step: 'any', inputMode: 'decimal' } }}
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
      <DialogActions
        sx={{
          justifyContent: isEdit ? 'space-between' : 'flex-end',
          // Keep the actions clear of the home-indicator on full-screen mobile
          pb: { xs: 'calc(10px + env(safe-area-inset-bottom))', sm: 1 },
        }}
      >
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
        <Box sx={{ display: 'flex', gap: 1, flex: { xs: 1, sm: 'none' }, '& > button': { flex: { xs: 1, sm: 'none' } } }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving || deleting}>
            {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Registrar'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
