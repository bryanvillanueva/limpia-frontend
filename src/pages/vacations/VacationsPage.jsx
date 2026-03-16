import { useState, useEffect, useCallback } from 'react';
import { Button, IconButton, Tooltip, Alert, TextField } from '@mui/material';
import { Add, Check, Close } from '@mui/icons-material';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import VacationRequestModal from './VacationRequestModal';
import { getAllVacations, getMyVacations, approveVacation, rejectVacation } from '../../services/vacations.service';
import { useAuth } from '../../context/AuthContext';

export default function VacationsPage({ mode = 'admin' }) {
  const { user } = useAuth();
  const isCleaner = mode === 'cleaner';

  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approving, setApproving] = useState(null);
  const [acting, setActing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setVacations(isCleaner ? await getMyVacations() : await getAllVacations());
    } catch { setError('Error al cargar vacaciones'); }
    finally { setLoading(false); }
  }, [isCleaner]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async () => {
    setActing(true);
    try { await approveVacation(approving.id); load(); }
    catch (err) { setError(err.response?.data?.message || 'Error'); }
    finally { setActing(false); setApproving(null); }
  };

  const handleReject = async () => {
    setActing(true);
    try { await rejectVacation(rejecting.id, rejectReason); load(); }
    catch (err) { setError(err.response?.data?.message || 'Error'); }
    finally { setActing(false); setRejecting(null); setRejectReason(''); }
  };

  const columns = [
    ...(!isCleaner ? [{ field: 'empleado', label: 'Empleado' }] : []),
    { field: 'fecha_inicio', label: 'Inicio', render: row => new Date(row.fecha_inicio).toLocaleDateString() },
    { field: 'fecha_fin', label: 'Fin', render: row => new Date(row.fecha_fin).toLocaleDateString() },
    { field: 'motivo', label: 'Motivo' },
    { field: 'estado', label: 'Estado', render: row => <StatusBadge value={row.estado} /> },
    ...(!isCleaner && user?.rol === 'admin' ? [{
      field: 'actions', label: 'Acciones', align: 'right',
      render: row => row.estado === 'pendiente' ? (
        <>
          <Tooltip title="Aprobar">
            <IconButton size="small" color="success" onClick={() => setApproving(row)}><Check fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Rechazar">
            <IconButton size="small" color="error" onClick={() => { setRejecting(row); setRejectReason(''); }}><Close fontSize="small" /></IconButton>
          </Tooltip>
        </>
      ) : null,
    }] : []),
  ];

  return (
    <>
      <PageHeader
        title={isCleaner ? 'Mis Vacaciones' : 'Vacaciones'}
        action={isCleaner && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setModalOpen(true)}>
            Solicitar
          </Button>
        )}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <DataTable columns={columns} rows={vacations} loading={loading} emptyMessage="No hay solicitudes de vacaciones" />

      {isCleaner && <VacationRequestModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={load} />}

      <ConfirmDialog
        open={!!approving}
        title="Aprobar vacaciones"
        message={`¿Aprobar la solicitud de ${approving?.empleado || 'este empleado'}?`}
        onConfirm={handleApprove}
        onClose={() => setApproving(null)}
        confirmColor="success"
      />

      <ConfirmDialog
        open={!!rejecting}
        title="Rechazar solicitud"
        message={
          <>
            <TextField
              label="Motivo de rechazo" fullWidth size="small" value={rejectReason}
              onChange={e => setRejectReason(e.target.value)} sx={{ mt: 1 }}
            />
          </>
        }
        onConfirm={handleReject}
        onClose={() => setRejecting(null)}
      />
    </>
  );
}
