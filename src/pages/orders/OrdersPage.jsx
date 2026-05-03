import { useState, useEffect, useCallback } from 'react';
import { Button, IconButton, Tooltip, Alert, Box, Stack, Typography } from '@mui/material';
import { Visibility, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import OrderDetailModal from './OrderDetailModal';
import { getOrders } from '../../services/orders.service';

/**
 * Admin/manager list of all supply orders with approval/rejection workflow.
 * Includes a "Nuevo pedido" action to navigate to the order catalog.
 */
export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setOrders(await getOrders()); }
    catch { setError('Error al cargar pedidos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { field: 'id', label: '#', render: row => `#${row.id}` },
    { field: 'solicitante', label: 'Solicitado por' },
    { field: 'equipo', label: 'Equipo', render: row => row.equipo ?? row.equipo_numero ?? '—' },
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
      field: 'actions', label: 'Acciones', align: 'right',
      render: row => (
        <Tooltip title="Ver detalle">
          <IconButton size="small" onClick={() => setSelected(row.id)}><Visibility fontSize="small" /></IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Pedidos de insumos"
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/pedidos/nuevo')}
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
        emptyMessage="No hay pedidos"
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
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Solicitado por: {row.solicitante || '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Equipo: {row.equipo ?? row.equipo_numero ?? '—'} · {fecha}
                </Typography>
              </Box>
              <Stack direction="row" justifyContent="flex-end">
                <Tooltip title="Ver detalle">
                  <IconButton size="small" onClick={() => setSelected(row.id)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          );
        }}
      />
      <OrderDetailModal
        open={!!selected}
        orderId={selected}
        onClose={() => setSelected(null)}
        onUpdated={load}
      />
    </>
  );
}
