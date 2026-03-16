import { useState, useMemo } from 'react';
import {
  Box, ToggleButton, ToggleButtonGroup, TextField, Button, Alert, Typography,
} from '@mui/material';
import { createLog } from '../../services/logs.service';

const today = () => new Date().toISOString().split('T')[0];

export default function LogForm({ site, onSaved }) {
  const [entryType, setEntryType] = useState('SERVICE');
  const [customValue, setCustomValue] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const canBins = site?.hace_bins === 1;
  const isOtro = entryType === 'OTHER';

  const previewValue = useMemo(() => {
    if (isOtro) return null;
    if (entryType === 'SERVICE') {
      const h = site?.horas_por_trabajador;
      return h != null ? `${h}h por trabajador` : 'Sin horas asignadas';
    }
    if (entryType === 'BINS') {
      const p = site?.pago_bins;
      return p != null ? `$${Number(p).toFixed(2)} pago bins` : 'Sin pago bins asignado';
    }
    return null;
  }, [site, entryType, isOtro]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOtro && (customValue === '' || isNaN(Number(customValue)) || Number(customValue) < 0)) {
      setError('Ingresá un valor numérico ≥ 0');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        site_id: site.id,
        fecha: today(),
        entry_type: isOtro ? 'CUSTOM' : entryType,
        observaciones: observaciones.trim() || undefined,
      };
      if (isOtro) payload.display_value = Number(customValue);
      await createLog(payload);
      setSuccess(true);
      setEntryType('SERVICE');
      setCustomValue('');
      setObservaciones('');
      if (onSaved) onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <Alert severity="success" action={<Button size="small" onClick={() => setSuccess(false)}>Nuevo log</Button>}>
        Log registrado para hoy
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

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
            Bins{!canBins && site ? ' (no aplica)' : ''}
          </ToggleButton>
          <ToggleButton value="OTHER" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Otro
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {previewValue && (
        <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">Valor estimado</Typography>
          <Typography variant="body2" fontWeight={600}>{previewValue}</Typography>
        </Box>
      )}

      {isOtro && (
        <TextField
          label="Valor personalizado"
          value={customValue}
          onChange={e => setCustomValue(e.target.value)}
          type="number"
          size="small"
          required
          slotProps={{ htmlInput: { min: 0, step: 'any' } }}
          fullWidth
        />
      )}

      <TextField
        label="Observaciones (opcional)"
        value={observaciones}
        onChange={e => setObservaciones(e.target.value)}
        multiline rows={2}
        size="small"
        fullWidth
      />

      <Button type="submit" variant="contained" disabled={saving} size="small">
        {saving ? 'Guardando…' : 'Registrar log'}
      </Button>
    </Box>
  );
}
