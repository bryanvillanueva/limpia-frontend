import { useState, useEffect, useCallback } from 'react';
import { Button, IconButton, Tooltip, Alert, Chip, Box, Stack, Typography } from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import GenerateReportModal from './GenerateReportModal';
import { getReports } from '../../services/reports.service';

export default function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setReports(await getReports()); }
    catch { setError('Error al cargar reportes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { field: 'id', label: '#', render: row => `#${row.id}` },
    { field: 'fecha_inicio', label: 'Inicio', render: row => new Date(row.fecha_inicio).toLocaleDateString() },
    { field: 'fecha_fin', label: 'Fin', render: row => new Date(row.fecha_fin).toLocaleDateString() },
    { field: 'created_at', label: 'Generado', render: row => new Date(row.created_at).toLocaleDateString() },
    {
      field: 'aprobado', label: 'Estado',
      render: row => <Chip label={row.aprobado ? 'Aprobado' : 'Pendiente'} color={row.aprobado ? 'success' : 'warning'} size="small" />,
    },
    {
      field: 'actions', label: 'Acciones', align: 'right',
      render: row => (
        <Tooltip title="Ver reporte">
          <IconButton size="small" onClick={() => navigate(`/reportes/${row.id}`)}><Visibility fontSize="small" /></IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Reportes"
        action={<Button variant="contained" startIcon={<Add />} onClick={() => setModalOpen(true)}>Generar reporte</Button>}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <DataTable
        columns={columns}
        rows={reports}
        loading={loading}
        emptyMessage="No hay reportes generados"
        mobileCardRender={(row) => (
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Typography variant="body2" fontWeight={700}>Reporte #{row.id}</Typography>
              <Chip label={row.aprobado ? 'Aprobado' : 'Pendiente'} color={row.aprobado ? 'success' : 'warning'} size="small" />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Período: {new Date(row.fecha_inicio).toLocaleDateString()} — {new Date(row.fecha_fin).toLocaleDateString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Generado: {new Date(row.created_at).toLocaleDateString()}
              </Typography>
            </Box>
            <Stack direction="row" justifyContent="flex-end">
              <Tooltip title="Ver reporte">
                <IconButton size="small" onClick={() => navigate(`/reportes/${row.id}`)}>
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        )}
      />
      <GenerateReportModal open={modalOpen} onClose={() => setModalOpen(false)} onGenerated={load} />
    </>
  );
}
