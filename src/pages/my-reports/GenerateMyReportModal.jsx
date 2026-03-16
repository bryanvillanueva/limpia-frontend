import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Checkbox, Alert, Button, DialogActions,
  Divider, Paper, ToggleButton, ToggleButtonGroup, Chip,
} from '@mui/material';
import FormModal from '../../components/ui/FormModal';
import { getPeriodLogs, generateReport } from '../../services/reports.service';

const ENTRY_TYPE_LABELS = { SERVICE: 'Service', BINS: 'Bins', CUSTOM: 'Personalizado' };

export default function GenerateMyReportModal({ open, onClose, cycle, onGenerated }) {
  const [logs, setLogs] = useState([]);
  const [excluded, setExcluded] = useState(new Set());
  const [estado, setEstado] = useState('enviado');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const billingPeriodId = cycle?.billing_period?.id;

  useEffect(() => {
    if (!open || !billingPeriodId) return;
    setLoading(true);
    setExcluded(new Set());
    setEstado('enviado');
    setError('');
    getPeriodLogs({ billing_period_id: billingPeriodId })
      .then(setLogs)
      .catch(() => setError('Error al cargar los logs del período'))
      .finally(() => setLoading(false));
  }, [open, billingPeriodId]);

  const toggleExclude = (id) => {
    setExcluded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const includedLogs = useMemo(() => logs.filter(l => !excluded.has(l.id)), [logs, excluded]);
  const total = useMemo(
    () => includedLogs.reduce((sum, l) => sum + Number(l.display_value || 0), 0),
    [includedLogs],
  );

  const handleSubmit = async () => {
    if (!billingPeriodId) { setError('No hay período activo'); return; }
    setSaving(true);
    setError('');
    try {
      const result = await generateReport({
        billing_period_id: billingPeriodId,
        excluded_log_ids: [...excluded],
        estado,
      });
      onGenerated(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al generar reporte');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal open={open} onClose={onClose} title="Generar reporte del período" maxWidth="md">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        {cycle?.billing_period && (
          <Typography variant="body2" color="text.secondary">
            Período:{' '}
            <strong>
              {new Date(cycle.billing_period.start_date).toLocaleDateString()} —{' '}
              {new Date(cycle.billing_period.end_date).toLocaleDateString()}
            </strong>
          </Typography>
        )}

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Estado del reporte
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={estado}
            onChange={(_, val) => { if (val) setEstado(val); }}
            size="small"
          >
            <ToggleButton value="borrador" sx={{ textTransform: 'none', fontWeight: 600 }}>Borrador</ToggleButton>
            <ToggleButton value="enviado"  sx={{ textTransform: 'none', fontWeight: 600 }}>Enviar</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider />

        <Box>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
            Logs del período ({logs.length})
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
            Marca los que deseas excluir del reporte
          </Typography>

          {loading ? (
            <Typography variant="body2" color="text.secondary">Cargando logs…</Typography>
          ) : logs.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No hay logs en este período</Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 320, overflowY: 'auto' }}>
              {logs.map(log => (
                <Paper
                  key={log.id}
                  variant="outlined"
                  sx={{
                    px: 2, py: 1,
                    opacity: excluded.has(log.id) ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', gap: 1.5,
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={excluded.has(log.id)}
                    onChange={() => toggleExclude(log.id)}
                    color="error"
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {log.site_name || log.site_id}
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
                          • {log.observaciones}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0 }}>
                    ${Number(log.display_value || 0).toFixed(2)}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Box>

        <Paper elevation={0} sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Total incluido ({includedLogs.length} de {logs.length} logs)
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              ${total.toFixed(2)}
            </Typography>
          </Box>
          {excluded.size > 0 && (
            <Typography variant="caption" color="text.secondary">
              {excluded.size} log{excluded.size > 1 ? 's' : ''} excluido{excluded.size > 1 ? 's' : ''}
            </Typography>
          )}
        </Paper>

        <DialogActions sx={{ px: 0, pb: 0 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || loading || !billingPeriodId}
          >
            {saving ? 'Generando…' : 'Generar reporte'}
          </Button>
        </DialogActions>
      </Box>
    </FormModal>
  );
}
