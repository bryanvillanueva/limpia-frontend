import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Button,
  IconButton,
  Tooltip,
  Alert,
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Skeleton,
  alpha,
} from '@mui/material';
import {
  Add,
  Edit,
  Search,
  Business,
  Phone,
  Email,
  Home,
} from '@mui/icons-material';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import ClientFormModal from './ClientFormModal';
import { getClients } from '../../services/clients.service';
import { useAuth } from '../../context/AuthContext';

/**
 * Stat card for displaying a metric with icon.
 * Reusable component consistent with UsersPage pattern.
 */
function StatCard({ icon, label, value, color = 'primary.main' }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          color,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Paper>
  );
}

/**
 * ClientsPage – Client management screen.
 * Displays statistics, search filter, and table of clients.
 * Admin, manager, and accountant can create/edit clients.
 */
export default function ClientsPage() {
  const { user } = useAuth();
  const canManage = ['admin', 'manager', 'accountant'].includes(user?.rol);

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setClients(await getClients());
    } catch {
      setError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) =>
        (c.nombre || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.telefono || '').includes(search) ||
        (c.direccion || '').toLowerCase().includes(q)
    );
  }, [clients, search]);

  const columns = [
    {
      field: 'nombre',
      label: 'Nombre',
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={600} color="primary.main">
            {row.nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.email || '—'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'telefono',
      label: 'Teléfono',
      render: (row) =>
        row.telefono ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Phone fontSize="small" color="action" />
            <Typography variant="body2">{row.telefono}</Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ),
    },
    {
      field: 'direccion',
      label: 'Dirección',
      render: (row) =>
        row.direccion ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.5,
              maxWidth: 200,
            }}
          >
            <Home
              fontSize="small"
              color="action"
              sx={{ mt: 0.25, flexShrink: 0 }}
            />
            <Typography
              variant="body2"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
              title={row.direccion}
            >
              {row.direccion}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        ),
    },
    ...(canManage
      ? [
          {
            field: 'actions',
            label: 'Acciones',
            align: 'right',
            render: (row) => (
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(row);
                    setModalOpen(true);
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            ),
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <>
        <PageHeader title="Clientes" subtitle="Gestión de clientes" />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 6, sm: 4 }} key={i}>
              <Skeleton variant="rounded" height={88} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={320} />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Gestión de clientes"
        action={
          canManage && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              Nuevo cliente
            </Button>
          )
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard
            icon={<Business />}
            label="Total clientes"
            value={clients.length}
          />
        </Grid>
      </Grid>

      {/* Search filter */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <TextField
          placeholder="Buscar por nombre, email, teléfono o dirección…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={filteredClients}
        loading={false}
        emptyMessage={
          search
            ? 'No hay clientes que coincidan con la búsqueda'
            : 'No hay clientes registrados'
        }
      />

      <ClientFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        client={editing}
        onSaved={load}
      />
    </>
  );
}
