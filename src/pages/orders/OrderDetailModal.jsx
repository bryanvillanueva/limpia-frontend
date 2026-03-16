import { useState, useEffect } from 'react';
import {
  DialogActions, Button, List, ListItem, ListItemText,
  Typography, Divider, Alert, Box, TextField,
} from '@mui/material';
import FormModal from '../../components/ui/FormModal';
import StatusBadge from '../../components/ui/StatusBadge';
import { getOrderById, approveOrder, completeOrder, rejectOrder } from '../../services/orders.service';

/**
 * Shows full detail of a supply order: requester, status, notes, items.
 * Admin/manager actions (approve, reject, complete) are hidden when readOnly is true.
 *
 * Supports two data modes:
 *  1. Pass `orderId` — the modal fetches the order via GET /supply-orders/:id.
 *  2. Pass `orderData` — uses the object directly without fetching (e.g. cleaner view
 *     where the list already includes nested items and the per-order endpoint is restricted).
 *
 * @param {boolean}       open       - Dialog visibility.
 * @param {Function}      onClose    - Close handler.
 * @param {number|null}   orderId    - Order ID to fetch (ignored when orderData is provided).
 * @param {Object|null}   orderData  - Pre-loaded order object; skips the API call when set.
 * @param {Function}      onUpdated  - Called after a status action succeeds.
 * @param {boolean}       readOnly   - If true, hides approve/reject/complete actions.
 */
export default function OrderDetailModal({ open, onClose, orderId, orderData = null, onUpdated, readOnly = false }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShowReject(false);
    setRejectReason('');
    setError('');

    if (orderData) {
      setOrder(orderData);
      return;
    }
    if (orderId) {
      setLoading(true);
      getOrderById(orderId).then(setOrder).catch(() => setError('Error al cargar')).finally(() => setLoading(false));
    }
  }, [open, orderId, orderData]);

  const act = async (fn) => {
    setActing(true);
    try { await fn(); onUpdated(); onClose(); }
    catch (err) { setError(err.response?.data?.message || 'Error'); }
    finally { setActing(false); }
  };

  return (
    <FormModal open={open} onClose={onClose} title="Detalle de pedido">
      {loading && <Typography>Cargando…</Typography>}
      {error && <Alert severity="error">{error}</Alert>}
      {order && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Solicitado por: <strong>{order.solicitante}</strong>
            </Typography>
            <StatusBadge value={order.estado} />
          </Box>
          {order.notas && <Typography variant="body2" sx={{ mb: 1 }}>Notas: {order.notas}</Typography>}
          <Divider sx={{ my: 1 }} />
          <List dense>
            {order.items?.map(item => (
              <ListItem key={item.id}>
                <ListItemText primary={item.insumo} secondary={`Cantidad: ${item.cantidad}`} />
              </ListItem>
            ))}
          </List>

          {!readOnly && order.estado === 'pendiente' && (
            <>
              {showReject ? (
                <Box sx={{ mt: 1 }}>
                  <TextField
                    label="Motivo de rechazo" fullWidth size="small" value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)} sx={{ mb: 1 }}
                  />
                  <Button
                    variant="contained" color="error" disabled={acting}
                    onClick={() => act(() => rejectOrder(orderId, rejectReason))}
                  >
                    Confirmar rechazo
                  </Button>
                  <Button onClick={() => setShowReject(false)} sx={{ ml: 1 }}>Cancelar</Button>
                </Box>
              ) : (
                <DialogActions sx={{ px: 0 }}>
                  <Button color="error" onClick={() => setShowReject(true)}>Rechazar</Button>
                  <Button variant="contained" disabled={acting} onClick={() => act(() => approveOrder(orderId))}>
                    Aprobar
                  </Button>
                </DialogActions>
              )}
            </>
          )}

          {!readOnly && order.estado === 'aprobado' && (
            <DialogActions sx={{ px: 0 }}>
              <Button variant="contained" color="success" disabled={acting} onClick={() => act(() => completeOrder(orderId))}>
                Marcar completado
              </Button>
            </DialogActions>
          )}
        </>
      )}
    </FormModal>
  );
}
