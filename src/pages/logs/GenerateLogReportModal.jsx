import { useState, useMemo } from 'react';
import {
  Box, Typography, Button, TextField, DialogActions, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FormModal from '../../components/ui/FormModal';
import { generateReport } from '../../services/reports.service';

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function GenerateLogReportModal({ open, onClose, currentWeekStart }) {
  const navigate = useNavigate();
  const defaultStart = currentWeekStart ? formatDate(getMonday(currentWeekStart)) : '';

  const [startDate, setStartDate] = useState(defaultStart);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Recalculate default when modal opens with new week
  const [lastDefault, setLastDefault] = useState(defaultStart);
  if (defaultStart !== lastDefault) {
    setStartDate(defaultStart);
    setLastDefault(defaultStart);
  }

  // Auto-calculate end date: Sunday of second week = startMonday + 13 days
  const endDate = useMemo(() => {
    if (!startDate) return '';
    const [y, m, d] = startDate.split('-').map(Number);
    const monday = new Date(y, m - 1, d);
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 13);
    return formatDate(sunday);
  }, [startDate]);

  const endLabel = useMemo(() => {
    if (!endDate) return '';
    const [y, m, d] = endDate.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, [endDate]);

  const handleSubmit = async () => {
    if (!startDate || !endDate) { setError('Selecciona la fecha de inicio'); return; }
    setSaving(true);
    setError('');
    try {
      const result = await generateReport({ fecha_inicio: startDate, fecha_fin: endDate });
      onClose();
      navigate(`/mis-reportes/${result.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar el reporte');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal open={open} onClose={onClose} title="Generar reporte de 2 semanas" maxWidth="sm">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Typography variant="body2" color="text.secondary">
          Selecciona el lunes de la primera semana. El reporte cubrira 2 semanas completas (lunes a domingo).
        </Typography>

        <TextField
          label="Lunes de inicio"
          type="date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setError(''); }}
          required
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />

        {endDate && (
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Periodo del reporte:
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {startDate} — {endDate}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Hasta el {endLabel}
            </Typography>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary">
          Solo se incluiran los logs que tengan datos registrados en estas 2 semanas.
        </Typography>

        <DialogActions sx={{ px: 0, pb: 0 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !startDate}
          >
            {saving ? 'Generando...' : 'Generar reporte'}
          </Button>
        </DialogActions>
      </Box>
    </FormModal>
  );
}
