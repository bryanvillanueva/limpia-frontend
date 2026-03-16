import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Alert, Typography, Chip, Button, ToggleButton, ToggleButtonGroup, Paper,
} from '@mui/material';
import { Add, CalendarMonth, EventBusy } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import LogReportGrid from '../../components/ui/LogReportGrid';
import GenerateMyReportModal from '../my-reports/GenerateMyReportModal';
import { getCycle, getPeriodLogs } from '../../services/reports.service';

/** Parses YYYY-MM-DD safely (no timezone drift). */
function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function TimeReportPage() {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState(null);
  const [logs, setLogs] = useState([]);
  const [cycleWeek, setCycleWeek] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const cyc = await getCycle();
      setCycle(cyc);
      if (cyc?.billing_period?.id) {
        const periodLogs = await getPeriodLogs({ billing_period_id: cyc.billing_period.id });
        setLogs(Array.isArray(periodLogs) ? periodLogs : []);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCycle(null);          // no active period for today
      } else {
        setError('Error al cargar los registros del período');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /** Monday of the selected week within the billing period. */
  const weekStartDate = useMemo(() => {
    if (!cycle?.billing_period?.start_date) return null;
    const start = parseDate(cycle.billing_period.start_date);
    if (cycleWeek === 2) start.setDate(start.getDate() + 7);
    return start;
  }, [cycle, cycleWeek]);

  const periodLabel = useMemo(() => {
    if (!cycle?.billing_period) return null;
    const start = parseDate(cycle.billing_period.start_date).toLocaleDateString();
    const end   = parseDate(cycle.billing_period.end_date).toLocaleDateString();
    return `${start} — ${end}`;
  }, [cycle]);

  const handleGenerated = (report) => {
    setModalOpen(false);
    if (report?.id) navigate(`/mis-reportes/${report.id}`);
  };

  return (
    <>
      <PageHeader
        title="Time Report"
        subtitle="Mis registros del período actual"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setModalOpen(true)}
            disabled={!cycle?.billing_period}
          >
            Generar reporte
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {!loading && !cycle?.billing_period ? (
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <EventBusy sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary">
            No hay período de facturación activo
          </Typography>
          <Typography variant="body2" color="text.disabled">
            No se encontró un período que cubra la fecha actual. Contacta a tu administrador.
          </Typography>
        </Paper>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 3 }}>
            {cycle?.billing_period && (
              <Paper
                elevation={0}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
              >
                <CalendarMonth color="primary" fontSize="small" />
                <Typography variant="body2" fontWeight={600}>Período:</Typography>
                <Typography variant="body2" color="text.secondary">{periodLabel}</Typography>
                {cycle.is_report_week && (
                  <Chip label="Semana de reporte" color="primary" size="small" />
                )}
              </Paper>
            )}

            <ToggleButtonGroup
              exclusive
              value={cycleWeek}
              onChange={(_, val) => { if (val != null) setCycleWeek(val); }}
              size="small"
            >
              <ToggleButton value={1} sx={{ px: 2, textTransform: 'none', fontWeight: 600 }}>Sem 1</ToggleButton>
              <ToggleButton value={2} sx={{ px: 2, textTransform: 'none', fontWeight: 600 }}>Sem 2</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              {logs.length} registro{logs.length !== 1 ? 's' : ''} en el período
            </Typography>
          </Box>

          <LogReportGrid
            logs={logs}
            weekStartDate={weekStartDate}
            loading={loading}
          />
        </>
      )}

      <GenerateMyReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cycle={cycle}
        onGenerated={handleGenerated}
      />
    </>
  );
}
