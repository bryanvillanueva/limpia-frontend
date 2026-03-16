import { useState, useEffect, useCallback } from 'react';
import { Button, IconButton, Tooltip, Alert } from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import ComplaintFormModal from './ComplaintFormModal';
import { getComplaints } from '../../services/complaints.service';
import { getSites } from '../../services/sites.service';
import { useAuth } from '../../context/AuthContext';

export default function ComplaintsPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  const [complaints, setComplaints] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([getComplaints(), getSites()]);
      setComplaints(c);
      setSites(s);
    } catch { setError('Error al cargar quejas'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { field: 'reportado_por', label: 'Reportado por' },
    { field: 'tipo', label: 'Tipo' },
    { field: 'descripcion', label: 'Descripción', render: row => row.descripcion?.slice(0, 60) + (row.descripcion?.length > 60 ? '…' : '') },
    { field: 'estado', label: 'Estado', render: row => <StatusBadge value={row.estado} /> },
    { field: 'created_at', label: 'Fecha', render: row => new Date(row.created_at).toLocaleDateString() },
    {
      field: 'actions', label: 'Acciones', align: 'right',
      render: row => (
        <Tooltip title="Editar">
          <IconButton size="small" onClick={() => { setEditing(row); setModalOpen(true); }}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Quejas"
        action={
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setModalOpen(true); }}>
            Nueva queja
          </Button>
        }
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <DataTable columns={columns} rows={complaints} loading={loading} emptyMessage="No hay quejas registradas" />
      <ComplaintFormModal open={modalOpen} onClose={() => setModalOpen(false)} complaint={editing} sites={sites} onSaved={load} />
    </>
  );
}
