import { useState, useEffect, useCallback } from 'react';
import { Box, Alert, Typography, Chip, Button, IconButton, Tooltip, Paper } from '@mui/material';
import { Add, Visibility, CalendarMonth } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import GenerateMyReportModal from './GenerateMyReportModal';
import { getMyReports, getCycle } from '../../services/reports.service';

const ESTADO_CHIP = {
  borrador: { label: 'Borrador', color: 'default' },
  enviado:  { label: 'Enviado',  color: 'warning' },
  aprobado: { label: 'Aprobado', color: 'success' },
};

export default function MyReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [reps, cyc] = await Promise.all([getMyReports(), getCycle()]);
      setReports(reps);
      setCycle(cyc);
    } catch {
      setError('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { field: 'id', label: '#', render: row => `#${row.id}` },
    { field: 'fecha_inicio', label: 'Inicio', render: row => new Date(row.fecha_inicio).toLocaleDateString() },
    { field: 'fecha_fin',    label: 'Fin',    render: row => new Date(row.fecha_fin).toLocaleDateString() },
    {
      field: 'estado', label: 'Estado',
      render: row => {
        const cfg = ESTADO_CHIP[row.estado] ?? { label: row.estado ?? 'Enviado', color: 'warning' };
        return <Chip label={cfg.label} color={cfg.color} size="small" />;
      },
    },
    {
      field: 'actions', label: '', align: 'right',
      render: row => (
        <Tooltip title="Ver reporte">
          <IconButton size="small" onClick={() => navigate(`/mis-reportes/${row.id}`)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Mis Reportes"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => setModalOpen(true)}>
            Generar reporte
          </Button>
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {cycle?.billing_period && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <CalendarMonth color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight={600}>Período actual:</Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(cycle.billing_period.start_date).toLocaleDateString()} — {new Date(cycle.billing_period.end_date).toLocaleDateString()}
            </Typography>
            {cycle.is_report_week && (
              <Chip label="Semana de reporte" color="primary" size="small" />
            )}
          </Box>
        </Paper>
      )}

      <DataTable
        columns={columns}
        rows={reports}
        loading={loading}
        emptyMessage="Aún no tienes reportes generados"
      />

      <GenerateMyReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cycle={cycle}
        onGenerated={() => { setModalOpen(false); load(); }}
      />
    </>
  );
}
