import { useState, useEffect, useCallback } from 'react';
import { Button, IconButton, Tooltip, Alert, Chip } from '@mui/material';
import { Add, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import GenerateReportModal from './GenerateReportModal';
import { getReports } from '../../services/reports.service';
import { useAuth } from '../../context/AuthContext';

export default function ReportsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAccountant = user?.rol === 'accountant';
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

  const buildTitle = (row) => {
    const nombre = [row.generado_por, row.generado_por_apellido].filter(Boolean).join(' ');
    const team = row.team_numero;
    const start = row.fecha_inicio ? new Date(row.fecha_inicio) : null;
    const end = row.fecha_fin ? new Date(row.fecha_fin) : null;
    const pad = (n) => String(n).padStart(2, '0');
    const fechaRange = start && end
      ? `semana del ${pad(start.getDate())} ${pad(start.getMonth() + 1)} al ${pad(end.getDate())} ${pad(end.getMonth() + 1)} del ${end.getFullYear()}`
      : '';
    const parts = ['Time Sheet'];
    if (team) parts.push(`Equipo ${team}`);
    if (nombre) parts.push(`(${nombre})`);
    if (fechaRange) parts.push(fechaRange);
    return parts.join(' - ');
  };

  const columns = [
    {
      field: 'id', label: 'Reporte',
      render: row => buildTitle(row),
    },
    { field: 'created_at', label: 'Generado', render: row => new Date(row.created_at).toLocaleDateString() },
    {
      field: 'estado', label: 'Estado',
      render: row => {
        const colors = { Borrador: 'default', Enviado: 'warning', Pagado: 'success', Devuelto: 'error', Eliminado: 'default' };
        const estado = row.estado || 'Enviado';
        const displayLabel = estado === 'Enviado' && isAccountant ? 'Pendiente' : estado;
        return <Chip label={displayLabel} color={colors[estado] || 'default'} size="small" />;
      },
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
      <DataTable columns={columns} rows={reports} loading={loading} emptyMessage="No hay reportes generados" />
      <GenerateReportModal open={modalOpen} onClose={() => setModalOpen(false)} onGenerated={load} />
    </>
  );
}
