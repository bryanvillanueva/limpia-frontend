import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Alert, Button, DialogActions,
  Divider, Paper, Chip,
} from '@mui/material';
import FormModal from '../../components/ui/FormModal';
import { getPeriodLogs, generateReport } from '../../services/reports.service';

const ENTRY_TYPE_LABELS = { SERVICE: 'Service', BINS: 'Bins', CUSTOM: 'Personalizado' };

// Every value in a report is hours (bins pay is expressed in hours too)
const fmtHours = (n) => `${Number(n || 0).toFixed(2).replace(/\.?0+$/, '') || '0'} h`;

export default function GenerateMyReportModal({ open, onClose, cycle, onGenerated }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const billingPeriodId = cycle?.billing_period?.id;

  useEffect(() => {
    if (!open || !billingPeriodId) return;
    setLoading(true);
    setError('');
    getPeriodLogs({ billing_period_id: billingPeriodId })
      // The endpoint returns { billing_period_id, fecha_inicio, fecha_fin, logs: [...] } (older versions returned the bare array)
      .then((data) => setLogs(Array.isArray(data) ? data : (data?.logs ?? [])))
      .catch(() => setError('Error al cargar los logs del periodo'))
      .finally(() => setLoading(false));
  }, [open, billingPeriodId]);

  const total = useMemo(
    () => logs.reduce((sum, l) => sum + Number(l.display_value || 0), 0),
    [logs],
  );

  const handleSubmit = async () => {
    if (!billingPeriodId) { setError('No hay periodo activo'); return; }
    setSaving(true);
    setError('');
    try {
      const result = await generateReport({
        billing_period_id: billingPeriodId,
        estado: 'Borrador', // reviewed first, sent later from the report page
      });
      onGenerated(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar reporte');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal open={open} onClose={onClose} title="Generar reporte del periodo" maxWidth="md">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        {cycle?.billing_period && (
          <Typography variant="body2" color="text.secondary">
            Periodo:{' '}
            <strong>
              {new Date(cycle.billing_period.start_date).toLocaleDateString()} —{' '}
              {new Date(cycle.billing_period.end_date).toLocaleDateString()}
            </strong>
          </Typography>
        )}

        <Alert severity="info">
          El reporte se crea como <strong>borrador</strong>: no se envía todavía. Podrás revisarlo y enviarlo a administración cuando esté listo.
        </Alert>

        <Divider />

        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
            Logs del periodo ({logs.length})
          </Typography>

          {loading ? (
            <Typography variant="body2" color="text.secondary">Cargando logs...</Typography>
          ) : logs.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No hay logs en este periodo</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 320, overflowY: 'auto' }}>
              {logs.map(log => (
                <Paper
                  key={log.id}
                  variant="outlined"
                  sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {log.sitio || log.site_name || log.site_id}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.fecha).toLocaleDateString()}
                      </Typography>
                      <Chip
                        label={ENTRY_TYPE_LABELS[log.entry_type] || log.entry_type}
                        size="small"
                        sx={{ height: 16, fontSize: 10 }}
                      />
                      {log.observaciones && (
                        <Typography variant="caption" color="text.secondary">
                          - {log.observaciones}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0 }}>
                    {fmtHours(log.display_value)}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>

        <Paper elevation={0} sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Total de horas ({logs.length} logs)
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {fmtHours(total)}
            </Typography>
          </Box>
        </Paper>

        <DialogActions sx={{ px: 0, pb: 0 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || loading || !billingPeriodId}
          >
            {saving ? 'Generando...' : 'Generar reporte'}
          </Button>
        </DialogActions>
      </Box>
    </FormModal>
  );
}
