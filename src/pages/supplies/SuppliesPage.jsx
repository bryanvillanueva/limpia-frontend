import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Button, IconButton, Tooltip, Alert, Box, LinearProgress, Typography,
  Avatar, TextField, InputAdornment,
} from '@mui/material';
import { Add, Edit, Inventory2, Search, Close } from '@mui/icons-material';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import ImagePreviewDialog from '../../components/ui/ImagePreviewDialog';
import SupplyFormModal from './SupplyFormModal';
import { getSupplies } from '../../services/supplies.service';
import { useAuth } from '../../context/AuthContext';

/**
 * Visual stock indicator with progress bar.
 * Handles NULL/undefined stock_minimo gracefully — treats it as "no minimum set".
 */
function StockBar({ actual, minimo }) {
  const safeActual = actual ?? 0;
  const hasMinimo = minimo != null && minimo > 0;
  const pct = hasMinimo ? Math.min(100, (safeActual / minimo) * 100) : 100;
  const color = hasMinimo
    ? (safeActual <= minimo ? 'error' : safeActual <= minimo * 1.5 ? 'warning' : 'success')
    : 'info';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ flex: 1 }}>
        <LinearProgress variant="determinate" value={pct} color={color} sx={{ borderRadius: 4, height: 6 }} />
      </Box>
      <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
        {safeActual}{hasMinimo ? ` / ${minimo}` : ''}
      </Typography>
    </Box>
  );
}

/**
 * Formats a numeric value as a currency string (USD).
 * Returns '—' for null/undefined values.
 */
const formatPrice = (value) => {
  if (value == null) return '—';
  return `$${Number(value).toFixed(2)}`;
};

/**
 * Admin/manager inventory management page.
 * Shows supplies with stock levels, pricing, and CRUD actions.
 * Pure inventory — no ordering/cart functionality.
 *
 * DB fields: id, nombre, descripcion, unidad, stock_actual, stock_minimo,
 * precio_unitario, imagen_url, proveedor_id.
 */
export default function SuppliesPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setSupplies(await getSupplies()); }
    catch { setError('Error al cargar insumos'); }
    finally { setLoading(false); }
  }, []);

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
      field: 'precio_unitario', label: 'Precio unit.',
      render: row => formatPrice(row.precio_unitario),
    },
    {
      field: 'stock', label: 'Stock',
      render: row => <StockBar actual={row.stock_actual} minimo={row.stock_minimo} />,
    },
    ...(isAdmin ? [{
      field: 'actions', label: 'Acciones', align: 'right',
      render: row => (
        <Tooltip title="Editar">
          <IconButton size="small" onClick={() => { setEditing(row); setModalOpen(true); }}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    }] : []),
  ];

  return (
    <>
      <PageHeader
        title="Supplies"
        subtitle="Inventario de insumos"
        action={isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setModalOpen(true); }}>
            Nuevo insumo
          </Button>
        )}
      />

      {/* Sticky search bar */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.default',
          pb: 2,
          pt: 0.5,
        }}
      >
        <TextField
          placeholder="Buscar por nombre, descripción o unidad…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          size="small"
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
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <DataTable
        columns={columns}
        rows={filteredSupplies}
        loading={loading}
        emptyMessage={searchQuery ? 'No se encontraron insumos' : 'No hay insumos registrados'}
      />

      <ImagePreviewDialog src={previewImage} onClose={() => setPreviewImage(null)} />
      <SupplyFormModal open={modalOpen} onClose={() => setModalOpen(false)} supply={editing} onSaved={load} />
    </>
  );
}
