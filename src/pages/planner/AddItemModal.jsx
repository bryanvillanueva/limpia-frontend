import { useState, useMemo } from 'react';
import {
  Box, TextField, Autocomplete, MenuItem, ToggleButton, ToggleButtonGroup,
  Typography, Alert, Button, DialogActions, Divider, IconButton,
} from '@mui/material';
import { Circle, RemoveCircleOutline } from '@mui/icons-material';
import FormModal from '../../components/ui/FormModal';

const COLOR_OPTIONS = [
  { value: 'yellow', hex: '#F9A825' },
  { value: 'red',    hex: '#E53935' },
  { value: 'green',  hex: '#43A047' },
  { value: 'blue',   hex: '#1E88E5' },
];

const DAY_OPTIONS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
];

/**
 * Formats a site object into a readable label for the Autocomplete dropdown.
 * @param {Object} site - Site object from getTeamSites().
 * @returns {string} Human-readable site label.
 */
function siteLabel(site) {
  return [site.direccion_linea1, site.suburb, site.state].filter(Boolean).join(', ');
}

/**
 * Modal form for adding a planner item to a specific day.
 * Lets the user pick a site, day, entry type (SERVICE/BINS), and optional comment.
 * Shows a value preview based on the selected site's assignment data.
 *
 * @param {boolean}  open          - Whether the modal is visible.
 * @param {Function} onClose       - Close handler.
 * @param {Function} onSubmit      - Called with { site_id, day_of_week, entry_type, item_comment } on save.
 * @param {Array}    availableSites - Sites from getTeamSites() for the dropdown.
 * @param {number|null} prefillDay - Pre-selected day_of_week (1–7) when clicking a cell.
 * @param {number|null} prefillSiteId - Pre-selected site_id when clicking a cell in an existing site row.
 * @param {boolean}  saving        - Disables submit while request is in-flight.
 */
export default function AddItemModal({
  open, onClose, onSubmit, availableSites = [], prefillDay = null, prefillSiteId = null, saving = false,
}) {
  const initialSite = prefillSiteId
    ? availableSites.find(s => s.site_id === prefillSiteId) ?? null
    : null;

  const [selectedSite, setSelectedSite] = useState(initialSite);
  const [dayOfWeek, setDayOfWeek] = useState(prefillDay ?? '');
  const [entryType, setEntryType] = useState('SERVICE');
  const [comment, setComment] = useState('');
  const [color, setColor] = useState(null);
  const [customValue, setCustomValue] = useState('');
  const [error, setError] = useState('');

  const canBins = selectedSite?.hace_bins === 1;
  const isOtro = entryType === 'OTHER';

  const handleSiteChange = (_, val) => {
    setSelectedSite(val);
    if (!val?.hace_bins && entryType === 'BINS') setEntryType('SERVICE');
  };

  /** Value preview text based on selected site and entry type. */
  const previewValue = useMemo(() => {
    if (!selectedSite || isOtro) return null;
    if (entryType === 'SERVICE') {
      const h = selectedSite.horas_por_trabajador;
      return h != null ? `${h}h por trabajador` : 'Sin horas asignadas';
    }
    if (entryType === 'BINS') {
      const p = selectedSite.pago_bins;
      return p != null ? `$${Number(p).toFixed(2)} pago bins` : 'Sin pago bins asignado';
    }
    return null;
  }, [selectedSite, entryType, isOtro]);

  const handleSubmit = () => {
    if (!selectedSite) { setError('Seleccioná un sitio'); return; }
    if (!dayOfWeek) { setError('Seleccioná un día'); return; }
    if (isOtro) {
      if (customValue === '' || isNaN(Number(customValue)) || Number(customValue) < 0) {
        setError('Ingresá un valor numérico ≥ 0');
        return;
      }
    }
    setError('');
    const payload = {
      site_id: selectedSite.site_id,
      day_of_week: Number(dayOfWeek),
      entry_type: isOtro ? 'SERVICE' : entryType,
      item_comment: comment.trim() || undefined,
      color,
    };
    if (isOtro) payload.display_value = Number(customValue);
    onSubmit(payload);
  };

  return (
    <FormModal open={open} onClose={onClose} title="Agregar Item al Planner" maxWidth="sm">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

        {/* Site selector */}
        <Autocomplete
          value={selectedSite}
          onChange={handleSiteChange}
          options={availableSites}
          getOptionLabel={siteLabel}
          isOptionEqualToValue={(opt, val) => opt.site_id === val.site_id}
          renderInput={(params) => <TextField {...params} label="Sitio" required />}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <li key={key} {...rest}>
                <Box>
                  <Typography variant="body2">{option.direccion_linea1}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {[option.suburb, option.state, option.postcode].filter(Boolean).join(', ')}
                  </Typography>
                </Box>
              </li>
            );
          }}
          noOptionsText="No hay sitios disponibles"
        />

        {/* Day selector */}
        <TextField
          select
          label="Día"
          value={dayOfWeek}
          onChange={(e) => setDayOfWeek(e.target.value)}
          required
        >
          {DAY_OPTIONS.map(d => (
            <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
          ))}
        </TextField>

        {/* Entry type toggle */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Tipo de entrada
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={entryType}
            onChange={(_, val) => { if (val) { setEntryType(val); if (val !== 'OTHER') setCustomValue(''); } }}
            size="small"
            fullWidth
          >
            <ToggleButton value="SERVICE" sx={{ textTransform: 'none', fontWeight: 600 }}>
              Service
            </ToggleButton>
            <ToggleButton value="BINS" disabled={!canBins} sx={{ textTransform: 'none', fontWeight: 600 }}>
              Bins {!canBins && selectedSite ? '(no aplica)' : ''}
            </ToggleButton>
            <ToggleButton value="OTHER" sx={{ textTransform: 'none', fontWeight: 600 }}>
              Otro
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Value preview for SERVICE/BINS */}
        {previewValue && (
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, px: 2, py: 1.25 }}>
            <Typography variant="caption" color="text.secondary">Valor estimado</Typography>
            <Typography variant="body2" fontWeight={600}>{previewValue}</Typography>
          </Box>
        )}

        {/* Custom value input — only visible when "Otro" is selected */}
        {isOtro && (
          <TextField
            label="Valor personalizado"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            type="number"
            required
            slotProps={{ htmlInput: { min: 0, step: 'any' } }}
          />
        )}

        {/* Color picker */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Color
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {COLOR_OPTIONS.map(c => (
              <IconButton
                key={c.value}
                size="small"
                onClick={() => setColor(c.value)}
                sx={{
                  p: 0.5,
                  border: color === c.value ? '2px solid' : '2px solid transparent',
                  borderColor: color === c.value ? c.hex : 'transparent',
                }}
              >
                <Circle sx={{ fontSize: 24, color: c.hex }} />
              </IconButton>
            ))}
            <IconButton
              size="small"
              onClick={() => setColor(null)}
              sx={{
                p: 0.5,
                border: color === null ? '2px solid' : '2px solid transparent',
                borderColor: color === null ? 'text.disabled' : 'transparent',
              }}
            >
              <RemoveCircleOutline sx={{ fontSize: 24, color: 'text.disabled' }} />
            </IconButton>
          </Box>
        </Box>

        {/* Optional comment */}
        <TextField
          label="Comentario (opcional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          multiline
          minRows={2}
          slotProps={{ htmlInput: { maxLength: 255 } }}
        />

        <Divider />

        <DialogActions sx={{ px: 0, pb: 0 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Guardando…' : 'Agregar'}
          </Button>
        </DialogActions>
      </Box>
    </FormModal>
  );
}
