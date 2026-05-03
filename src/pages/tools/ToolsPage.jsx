/**
 * Tools listing page.
 * Displays all tools with columns matching the `tools` DB table: code, nombre,
 * descripcion, precio_unitario, ubicacion, equipo, requiere_mantenimiento, and actions.
 * Admin users can create, edit, delete, and import tools.
 */
import { useState, useEffect, useCallback } from 'react';
import { Button, IconButton, Tooltip, Alert, Box, Typography, Chip, Stack } from '@mui/material';
import { Add, Edit, Delete, Upload, CheckCircle, Cancel } from '@mui/icons-material';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ToolFormModal from './ToolFormModal';
import ToolImportModal from './ToolImportModal';
import { getTools, deleteTool } from '../../services/tools.service';
import { useAuth } from '../../context/AuthContext';

/**
 * Formats a numeric value as AUD currency.
 * @param {number|string|null} val - Raw price value.
 * @returns {string} Formatted price or dash.
 */
const fmtPrice = (val) => {
  if (val == null || val === '') return '—';
  return `$${Number(val).toFixed(2)}`;
};

export default function ToolsPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setTools(await getTools()); }
    catch { setError('Error al cargar herramientas'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    try { await deleteTool(deleting.id); load(); }
    catch { setError('Error al eliminar'); }
    setDeleting(null);
  };

  const columns = [
    {
      field: 'code',
      label: 'Código',
      render: (row) => row.code || '—',
    },
    {
      field: 'nombre',
      label: 'Herramienta',
      render: (row) => (
        <Typography variant="body2" fontWeight={600}>{row.nombre}</Typography>
      ),
    },
    { field: 'descripcion', label: 'Descripción' },
    {
      field: 'precio_unitario',
      label: 'Precio',
      render: (row) => fmtPrice(row.precio_unitario),
    },
    {
      field: 'ubicacion',
      label: 'Ubicación',
      render: (row) => <StatusBadge value={row.ubicacion || 'oficina'} />,
    },
    {
      field: 'equipo_numero',
      label: 'Equipo',
      render: (row) =>
        row.equipo_numero
          ? <Chip label={row.equipo_numero} size="small" color="primary" variant="outlined" />
          : <Typography variant="body2" color="text.disabled">—</Typography>,
    },
    {
      field: 'requiere_mantenimiento',
      label: 'Mantenimiento',
      render: (row) =>
        row.requiere_mantenimiento
          ? <CheckCircle fontSize="small" color="success" />
          : <Cancel fontSize="small" sx={{ color: 'text.disabled' }} />,
    },
    ...(isAdmin ? [{
      field: 'actions', label: 'Acciones', align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => { setEditing(row); setModalOpen(true); }}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" color="error" onClick={() => setDeleting(row)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    }] : []),
  ];

  return (
    <>
      <PageHeader
        title="Herramientas"
        action={isAdmin && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button variant="outlined" startIcon={<Upload />} onClick={() => setImportModalOpen(true)}>
              Importar Herramientas
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setModalOpen(true); }}>
              Nueva herramienta
            </Button>
          </Stack>
        )}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <DataTable
        columns={columns}
        rows={tools}
        loading={loading}
        emptyMessage="No hay herramientas registradas"
        mobileCardRender={(row) => (
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700}>{row.nombre}</Typography>
                {row.code && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {row.code}
                  </Typography>
                )}
              </Box>
              <StatusBadge value={row.ubicacion || 'oficina'} />
            </Box>
            {row.descripcion && (
              <Typography variant="caption" color="text.secondary">{row.descripcion}</Typography>
            )}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              <Typography variant="caption">Precio: <strong>{fmtPrice(row.precio_unitario)}</strong></Typography>
              {row.equipo_numero && (
                <Chip label={`Equipo ${row.equipo_numero}`} size="small" color="primary" variant="outlined" />
              )}
              {row.requiere_mantenimiento && (
                <Chip label="Requiere mantenimiento" size="small" color="warning" variant="outlined" icon={<CheckCircle sx={{ fontSize: 14 }} />} />
              )}
            </Stack>
            {isAdmin && (
              <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => { setEditing(row); setModalOpen(true); }}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton size="small" color="error" onClick={() => setDeleting(row)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>
        )}
      />
      <ToolFormModal open={modalOpen} onClose={() => setModalOpen(false)} tool={editing} onSaved={load} />
      <ConfirmDialog
        open={!!deleting}
        title="Eliminar herramienta"
        message={`¿Eliminar "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      />
      <ToolImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={load}
      />
    </>
  );
}
