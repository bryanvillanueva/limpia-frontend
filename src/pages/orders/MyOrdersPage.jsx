import { useState, useEffect, useCallback } from 'react';
import { Button, IconButton, Tooltip, Alert, Box, Stack, Typography } from '@mui/material';
import { Visibility, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import OrderDetailModal from './OrderDetailModal';
import { getMyOrders } from '../../services/orders.service';

/**
 * Cleaner view of their team's supply orders.
 * Shows order history with status, date, and a read-only detail modal.
 * Includes a "Nuevo pedido" action to navigate to the order catalog.
 */
export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setOrders(await getMyOrders()); }
    catch { setError('Error al cargar pedidos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { field: 'id', label: '#', render: row => `#${row.id}` },
    { field: 'solicitante', label: 'Solicitado por' },
    { field: 'estado', label: 'Estado', render: row => <StatusBadge value={row.estado} /> },
    {
      field: 'fecha', label: 'Fecha',
      render: row => {
        const raw = row.fecha ?? row.created_at;
        if (!raw) return '—';
        const d = new Date(raw);
        return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
      },
    },
    {
      field: 'actions', label: '', align: 'right',
      render: row => (
        <Tooltip title="Ver detalle">
          <IconButton size="small" onClick={() => setSelectedOrder(row)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Mis Pedidos"
        subtitle="Pedidos de insumos de tu equipo"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/mis-pedidos/nuevo')}
          >
            Nuevo pedido
          </Button>
        }
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <DataTable
        columns={columns}
        rows={orders}
        loading={loading}
        emptyMessage="No hay pedidos aún"
        mobileCardRender={(row) => {
          const raw = row.fecha ?? row.created_at;
          const d = raw ? new Date(raw) : null;
          const fecha = d && !isNaN(d.getTime()) ? d.toLocaleDateString() : '—';
          return (
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="body2" fontWeight={700}>Pedido #{row.id}</Typography>
                <StatusBadge value={row.estado} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {row.solicitante || '—'} · {fecha}
              </Typography>
              <Stack direction="row" justifyContent="flex-end">
                <Tooltip title="Ver detalle">
                  <IconButton size="small" onClick={() => setSelectedOrder(row)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          );
        }}
      />
      <OrderDetailModal
        open={!!selectedOrder}
        orderData={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdated={load}
        readOnly
      />
    </>
  );
}
