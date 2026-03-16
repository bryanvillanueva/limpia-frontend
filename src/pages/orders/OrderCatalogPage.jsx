import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Button, IconButton, Tooltip, Alert, Box, Typography, Avatar, TextField,
  Badge, Dialog, DialogTitle, DialogContent, DialogActions, Popover, Snackbar,
  Table, TableHead, TableBody, TableRow, TableCell, InputAdornment, MenuItem,
} from '@mui/material';
import {
  Add, Inventory2, Search, Close, Remove, Delete, ShoppingCartCheckout,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import ImagePreviewDialog from '../../components/ui/ImagePreviewDialog';
import { getSupplies } from '../../services/supplies.service';
import { createOrder } from '../../services/orders.service';
import { getTeams } from '../../services/teams.service';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

/** Roles that must manually choose a team when placing an order. */
const TEAM_SELECTOR_ROLES = ['admin', 'manager', 'accountant'];

/**
 * Popover with quantity selector for adding a supply to the cart.
 * @param {HTMLElement|null} anchorEl - Anchor for popover positioning.
 * @param {Function} onClose - Close handler.
 * @param {Function} onAdd - Called with the chosen quantity (number).
 */
function AddToCartPopover({ anchorEl, onClose, onAdd }) {
  const [qty, setQty] = useState(1);

  useEffect(() => { if (anchorEl) setQty(1); }, [anchorEl]);

  const handleConfirm = () => { onAdd(qty); onClose(); };

  return (
    <Popover
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{ paper: { sx: { p: 2, display: 'flex', alignItems: 'center', gap: 1 } } }}
    >
      <IconButton size="small" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>
        <Remove fontSize="small" />
      </IconButton>
      <TextField
        size="small"
        type="number"
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        sx={{ width: 64 }}
        slotProps={{ input: { inputProps: { min: 1, style: { textAlign: 'center' } } } }}
      />
      <IconButton size="small" onClick={() => setQty(q => q + 1)}>
        <Add fontSize="small" />
      </IconButton>
      <Button variant="contained" size="small" onClick={handleConfirm}>
        Agregar
      </Button>
    </Popover>
  );
}

/**
 * Cart summary dialog for reviewing and confirming a supply order.
 * No pricing info -- only items, quantities, team selector (role-based), and notes.
 *
 * @param {boolean}  open          - Dialog visibility.
 * @param {Function} onClose       - Close handler.
 * @param {Array}    cart           - Cart items: { supply_id, nombre, cantidad, imagen_url, unidad }.
 * @param {Function} onUpdateQty   - Called with (supply_id, newQty).
 * @param {Function} onRemove      - Called with supply_id.
 * @param {Function} onConfirm     - Called with { equipo_id, notas } when order is confirmed.
 * @param {boolean}  saving        - Whether the order is being submitted.
 * @param {boolean}  needsTeam     - Whether to show the team selector.
 * @param {Array}    teams         - Available teams for the selector.
 */
function CartSummaryDialog({
  open, onClose, cart, onUpdateQty, onRemove, onConfirm, saving, needsTeam, teams,
}) {
  const [notas, setNotas] = useState('');
  const [equipoId, setEquipoId] = useState('');

  useEffect(() => {
    if (open) {
      setNotas('');
      setEquipoId('');
    }
  }, [open]);

  const canConfirm = cart.length > 0 && (!needsTeam || equipoId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" component="span">Resumen del pedido</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'divider', p: 0 }}>
        {cart.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            El carrito está vacío
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Insumo</TableCell>
                <TableCell align="center">Cantidad</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {cart.map((item) => (
                <TableRow key={item.supply_id}>
                  <TableCell sx={{ width: 48, p: 0.5 }}>
                    <Avatar
                      variant="rounded"
                      src={item.imagen_url || undefined}
                      sx={{ width: 36, height: 36, bgcolor: 'action.selected' }}
                    >
                      {!item.imagen_url && <Inventory2 fontSize="small" color="disabled" />}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.nombre}</Typography>
                    {item.unidad && (
                      <Typography variant="caption" color="text.secondary">{item.unidad}</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => onUpdateQty(item.supply_id, Math.max(1, item.cantidad - 1))}
                        disabled={item.cantidad <= 1}
                      >
                        <Remove sx={{ fontSize: 16 }} />
                      </IconButton>
                      <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'center' }}>
                        {item.cantidad}
                      </Typography>
                      <IconButton size="small" onClick={() => onUpdateQty(item.supply_id, item.cantidad + 1)}>
                        <Add sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: 40 }}>
                    <IconButton size="small" color="error" onClick={() => onRemove(item.supply_id)}>
                      <Delete sx={{ fontSize: 18 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {cart.length > 0 && (
          <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {needsTeam && (
              <TextField
                select
                label="Equipo"
                value={equipoId}
                onChange={(e) => setEquipoId(e.target.value)}
                required
                fullWidth
                helperText="Selecciona el equipo para este pedido"
              >
                {teams.map(t => (
                  <MenuItem key={t.id} value={t.id}>{t.numero}</MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              label="Notas (opcional)"
              multiline
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              fullWidth
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1.5 }}>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={() => onConfirm({ equipo_id: equipoId || undefined, notas: notas || undefined })}
          disabled={saving || !canConfirm}
        >
          {saving ? 'Enviando…' : 'Confirmar pedido'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Supply catalog page optimized for creating orders.
 * Shared by admin/manager/accountant (with team selector) and cleaner (auto team).
 * Shows supply images, names, and units — no pricing or stock info.
 *
 * Floating bottom bar provides always-accessible search and cart access.
 */
export default function OrderCatalogPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const needsTeam = TEAM_SELECTOR_ROLES.includes(user?.rol);

  const [supplies, setSupplies] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Image preview
  const [previewImage, setPreviewImage] = useState(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Cart
  const [cart, setCart] = useState([]);
  const [cartAnchorEl, setCartAnchorEl] = useState(null);
  const [cartTargetRow, setCartTargetRow] = useState(null);

  // Cart summary dialog
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);

  // Success feedback
  const [snackbar, setSnackbar] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [suppliesData, teamsData] = await Promise.all([
        getSupplies(),
        needsTeam ? getTeams() : Promise.resolve([]),
      ]);
      setSupplies(suppliesData);
      setTeams(teamsData.filter(t => t.activo));
    } catch {
      setError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [needsTeam]);

  useEffect(() => { load(); }, [load]);

  /** Client-side filter by nombre, descripcion, and unidad. */
  const filteredSupplies = useMemo(() => {
    if (!searchQuery.trim()) return supplies;
    const q = searchQuery.toLowerCase().trim();
    return supplies.filter(s =>
      (s.nombre ?? '').toLowerCase().includes(q) ||
      (s.descripcion ?? '').toLowerCase().includes(q) ||
      (s.unidad ?? '').toLowerCase().includes(q)
    );
  }, [supplies, searchQuery]);

  // ---- Cart helpers ----

  /**
   * Adds a supply to the cart. Merges quantity if the item already exists.
   * @param {Object} row - The supply row from the table.
   * @param {number} qty - Quantity to add.
   */
  const addToCart = (row, qty) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.supply_id === row.id);
      if (idx >= 0) {
        return prev.map((c, i) => i === idx ? { ...c, cantidad: c.cantidad + qty } : c);
      }
      return [...prev, {
        supply_id: row.id,
        nombre: row.nombre,
        cantidad: qty,
        imagen_url: row.imagen_url,
        unidad: row.unidad,
      }];
    });
  };

  const updateCartQty = (supplyId, newQty) => {
    setCart(prev => prev.map(c => c.supply_id === supplyId ? { ...c, cantidad: newQty } : c));
  };

  const removeFromCart = (supplyId) => {
    setCart(prev => prev.filter(c => c.supply_id !== supplyId));
  };

  /**
   * Submits the cart as a supply order via the createOrder API.
   * Admin/manager/accountant must provide equipo_id; cleaner relies on backend resolution.
   */
  const handleConfirmOrder = async ({ equipo_id, notas }) => {
    setOrderSaving(true);
    try {
      const payload = {
        items: cart.map(c => ({ supply_id: c.supply_id, cantidad: c.cantidad })),
      };
      if (equipo_id) payload.equipo_id = equipo_id;
      if (notas) payload.notas = notas;

      await createOrder(payload);
      setCart([]);
      setSummaryOpen(false);
      setSnackbar('Pedido creado exitosamente');

      const redirectTo = user?.rol === 'cleaner' ? '/mis-pedidos' : '/pedidos';
      setTimeout(() => navigate(redirectTo, { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el pedido');
    } finally {
      setOrderSaving(false);
    }
  };

  // ---- Popover handlers ----

  const openCartPopover = (event, row) => {
    setCartAnchorEl(event.currentTarget);
    setCartTargetRow(row);
  };

  const closeCartPopover = () => {
    setCartAnchorEl(null);
    setCartTargetRow(null);
  };

  // ---- Table columns (catalog view: no prices, no stock) ----

  const columns = [
    {
      field: 'imagen', label: '',
      render: row => (
        <Avatar
          variant="rounded"
          src={row.imagen_url || undefined}
          sx={{
            width: 64, height: 64,
            bgcolor: 'action.selected',
            cursor: row.imagen_url ? 'pointer' : 'default',
            transition: 'transform 0.15s',
            '&:hover': row.imagen_url ? { transform: 'scale(1.08)' } : {},
          }}
          onClick={() => { if (row.imagen_url) setPreviewImage(row.imagen_url); }}
        >
          {!row.imagen_url && <Inventory2 color="disabled" />}
        </Avatar>
      ),
    },
    { field: 'nombre', label: 'Insumo' },
    { field: 'descripcion', label: 'Descripción' },
    { field: 'unidad', label: 'Unidad' },
    {
      field: 'actions', label: '', align: 'right',
      render: row => (
        <Tooltip title="+ Agregar producto">
          <IconButton size="small" color="primary" onClick={(e) => openCartPopover(e, row)}>
            <Add fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const totalCartItems = cart.reduce((sum, c) => sum + c.cantidad, 0);

  return (
    <>
      <PageHeader
        title="Nuevo pedido"
        subtitle="Selecciona los insumos que necesitas"
      />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ pb: 10 }}>
        <DataTable
          columns={columns}
          rows={filteredSupplies}
          loading={loading}
          emptyMessage={searchQuery ? 'No se encontraron insumos' : 'No hay insumos disponibles'}
        />
      </Box>

      {/* ---- Floating bottom bar: search + cart ---- */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: { xs: 0, md: `${DRAWER_WIDTH}px` },
          right: 0,
          zIndex: (theme) => theme.zIndex.appBar - 1,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
        }}
      >
        <TextField
          placeholder="Buscar por nombre, descripción o unidad…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><Search color="action" /></InputAdornment>
              ),
              ...(searchQuery && {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }),
            },
          }}
        />

        <Badge badgeContent={totalCartItems} color="error" max={99}>
          <Button
            variant={cart.length > 0 ? 'contained' : 'outlined'}
            color={cart.length > 0 ? 'primary' : 'inherit'}
            startIcon={<ShoppingCartCheckout />}
            onClick={() => setSummaryOpen(true)}
            disabled={cart.length === 0}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Completar pedido
          </Button>
        </Badge>
      </Box>

      {/* Add-to-cart popover */}
      <AddToCartPopover
        anchorEl={cartAnchorEl}
        onClose={closeCartPopover}
        onAdd={(qty) => { if (cartTargetRow) addToCart(cartTargetRow, qty); }}
      />

      {/* Image lightbox */}
      <ImagePreviewDialog src={previewImage} onClose={() => setPreviewImage(null)} />

      {/* Cart summary / order confirmation */}
      <CartSummaryDialog
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
        cart={cart}
        onUpdateQty={updateCartQty}
        onRemove={removeFromCart}
        onConfirm={handleConfirmOrder}
        saving={orderSaving}
        needsTeam={needsTeam}
        teams={teams}
      />

      {/* Success snackbar */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={4000}
        onClose={() => setSnackbar('')}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
