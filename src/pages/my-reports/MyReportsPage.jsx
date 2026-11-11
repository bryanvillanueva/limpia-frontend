import { useState, useEffect, useCallback } from 'react';
import { Box, Alert, Typography, Chip, Button, IconButton, Tooltip, Paper, Stack } from '@mui/material';
import { Add, Visibility, CalendarMonth, DeleteOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import GenerateMyReportModal from './GenerateMyReportModal';
import { getMyReports, getCycle, deleteReport } from '../../services/reports.service';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function MyReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(null); // draft pending confirmation

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

  /** Deletes the draft the user confirmed, then refreshes the list. */
  const handleDeleteDraft = async () => {
    try {
      await deleteReport(deleting.id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar el borrador');
    }
  };

  /** Trash button, only for drafts (reports that were never sent). */
  const deleteButton = (row) => row.estado === 'Borrador' && (
    <Tooltip title="Eliminar borrador">
      <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleting(row); }}>
        <DeleteOutline fontSize="small" />
      </IconButton>
    </Tooltip>
  );

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
    {
      field: 'estado', label: 'Estado',
      render: row => {
        const estado = row.estado || 'Enviado';
        return <StatusBadge value={estado} />;
      },
    },
    {
      field: 'actions', label: '', align: 'right',
      render: row => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title="Ver reporte">
            <IconButton size="small" onClick={() => navigate(`/mis-reportes/${row.id}`)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {deleteButton(row)}
        </Box>
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
        mobileCardRender={(row) => {
          const estado = row.estado || 'Enviado';
          return (
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="body2" fontWeight={700}>{buildTitle(row)}</Typography>
                <StatusBadge value={estado} />
              </Box>
              <Stack direction="row" justifyContent="flex-end">
                <Tooltip title="Ver reporte">
                  <IconButton size="small" onClick={() => navigate(`/mis-reportes/${row.id}`)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
                {deleteButton(row)}
              </Stack>
            </Stack>
          );
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        title="¿Eliminar este borrador?"
        message="Se eliminará el borrador del reporte. Tus logs no se borran y podrás generar otro reporte cuando quieras. Esta acción no se puede deshacer."
        onConfirm={handleDeleteDraft}
        onClose={() => setDeleting(null)}
      />

      <GenerateMyReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cycle={cycle}
        onGenerated={(result) => {
          setModalOpen(false);
          // The report is created as a draft: open it so it can be reviewed before sending
          navigate(`/mis-reportes/${result.id}`);
        }}
      />
    </>
  );
}
