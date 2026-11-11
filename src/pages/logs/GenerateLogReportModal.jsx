import { useState, useMemo } from 'react';
import {
  Box, Typography, Button, DialogActions, Alert, Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FormModal from '../../components/ui/FormModal';
import { generateReport } from '../../services/reports.service';
import DateField from '../../components/ui/DateField';
import { getCycleWeek, getReportPeriodStart, isReportPeriodStart } from '../../utils/cycle';

function formatDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const fmtShort = (d) => d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
const fmtLong = (d) => d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

/**
 * Generates the report of one 2-week period. Periods follow the internal 4-week cycle:
 * weeks 1+2 or weeks 3+4, so the start can only be the Monday of a week 1 or a week 3.
 * By default it proposes the period that contains the week being viewed (in week 4 that is
 * the period that started the Monday before, not this week's Monday).
 * The report is created as a draft; it is reviewed and sent from its own page.
 */
export default function GenerateLogReportModal({ open, onClose, currentWeekStart }) {
  const navigate = useNavigate();
  const defaultStart = formatDate(getReportPeriodStart(currentWeekStart || new Date()));

  const [startDate, setStartDate] = useState(defaultStart);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Recalculate default when the viewed week changes
  const [lastDefault, setLastDefault] = useState(defaultStart);
  if (defaultStart !== lastDefault) {
    setStartDate(defaultStart);
    setLastDefault(defaultStart);
  }

  // Current period and the previous one, as quick picks
  const quickPicks = useMemo(() => {
    const current = getReportPeriodStart(new Date());
    return [
      { key: 'current', label: 'Período actual', start: current },
      { key: 'previous', label: 'Período anterior', start: addDays(current, -14) },
    ].map((p) => ({ ...p, value: formatDate(p.start), range: `${fmtShort(p.start)} – ${fmtShort(addDays(p.start, 13))}` }));
  }, []);

  const start = startDate ? parseDate(startDate) : null;
  const validStart = !!start && isReportPeriodStart(start);
  const end = validStart ? addDays(start, 13) : null; // Sunday of the second week
  const endDate = end ? formatDate(end) : '';
  const firstWeek = validStart ? getCycleWeek(start) : null;

  const handleSubmit = async () => {
    if (!validStart) { setError('El período debe empezar un lunes de semana 1 o semana 3 del ciclo'); return; }
    setSaving(true);
    setError('');
    try {
      const result = await generateReport({ fecha_inicio: startDate, fecha_fin: endDate, estado: 'Borrador' });
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
          Cada reporte cubre un período de 2 semanas del ciclo: semanas 1 y 2, o semanas 3 y 4.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {quickPicks.map((p) => (
            <Chip
              key={p.key}
              label={`${p.label} · ${p.range}`}
              clickable
              color={startDate === p.value ? 'primary' : 'default'}
              variant={startDate === p.value ? 'filled' : 'outlined'}
              onClick={() => { setStartDate(p.value); setError(''); }}
            />
          ))}
        </Box>

        <DateField
          label="Lunes de inicio"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setError(''); }}
          required
          fullWidth
          // Only the Mondays that start a period (cycle week 1 or 3) can be picked
          shouldDisableDate={(d) => !isReportPeriodStart(d.toDate())}
          error={!!startDate && !validStart}
          helperText={!!startDate && !validStart ? 'Elige un lunes de semana 1 o semana 3 del ciclo' : undefined}
        />

        {validStart && (
          <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Semanas {firstWeek} y {firstWeek + 1} del ciclo
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {fmtShort(start)} — {fmtShort(end)} de {end.getFullYear()}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'none', letterSpacing: 0 }}>
              Hasta el {fmtLong(end)}
            </Typography>
          </Box>
        )}

        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'none', letterSpacing: 0 }}>
          Solo se incluirán los logs que tengan datos registrados en estas 2 semanas. Se crea como borrador: lo revisas y lo envías después.
        </Typography>

        <DialogActions sx={{ px: 0, pb: 0 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !validStart}
          >
            {saving ? 'Generando...' : 'Generar reporte'}
          </Button>
        </DialogActions>
      </Box>
    </FormModal>
  );
}
