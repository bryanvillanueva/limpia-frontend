import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  alpha,
} from '@mui/material';
import {
  Add,
  Edit,
  PersonOff,
  Search,
  People,
  CheckCircle,
  Cancel,
  AdminPanelSettings,
  Phone,
  Warning,
  Home,
  Visibility,
} from '@mui/icons-material';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import UserFormModal from './UserFormModal';
import UserDetailModal from './UserDetailModal';
import { getUsers, deactivateUser } from '../../services/users.service';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = { admin: 'Admin', manager: 'Manager', accountant: 'accountant', cleaner: 'Cleaner / Gardener' };
const ROLE_COLORS = { admin: 'error', manager: 'warning', accountant: 'info', cleaner: 'success' };

/**
 * Formatea una fecha ISO a formato legible (dd/mm/yyyy).
 * Retorna '—' si la fecha es nula o inválida.
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Determina si una visa está próxima a vencer (dentro de 30 días) o ya venció.
 */
function getVisaStatus(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  const diffDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'warning';
  return 'ok';
}

/**
 * Tarjeta de estadística reutilizable para mostrar métricas resumidas.
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
 * Página principal de gestión de usuarios.
 * Muestra estadísticas, filtros y tabla completa con todos los campos del modelo de usuario.
 */
export default function UsersPage() {
  const { user: me } = useAuth();
  const isAdmin = me?.rol === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deactivating, setDeactivating] = useState(null);
  const [viewing, setViewing] = useState(null);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await getUsers());
    } catch {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleView = (u) => { setViewing(u); };
  const handleEdit = (u) => { setEditing(u); setModalOpen(true); };
  const handleNew = () => { setEditing(null); setModalOpen(true); };
  const handleDeactivate = async () => {
    try {
      await deactivateUser(deactivating.id);
      load();
    } catch {
      setError('Error al desactivar');
    }
    setDeactivating(null);
  };

  const stats = useMemo(() => {
    const total = users.length;
    const activos = users.filter(u => u.activo).length;
    const inactivos = total - activos;
    const admins = users.filter(u => u.rol === 'admin').length;
    return { total, activos, inactivos, admins };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        !search ||
        `${u.nombre} ${u.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.telefono?.includes(search);
      const matchesRole = filterRole === 'all' || u.rol === filterRole;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && u.activo) ||
        (filterStatus === 'inactive' && !u.activo);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  const columns = [
    {
      field: 'nombre',
      label: 'Nombre',
      render: row => (
        <Box>
          <Typography
            variant="body2"
            fontWeight={600}
            color="primary.main"
          >
            {row.nombre} {row.apellido}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'telefono',
      label: 'Teléfono',
      render: row => row.telefono ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Phone fontSize="small" color="action" />
          <Typography variant="body2">{row.telefono}</Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.disabled">—</Typography>
      ),
    },
    {
      field: 'direccion',
      label: 'Dirección',
      render: row => row.direccion ? (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, maxWidth: 200 }}>
          <Home fontSize="small" color="action" sx={{ mt: 0.25, flexShrink: 0 }} />
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
        <Typography variant="body2" color="text.disabled">—</Typography>
      ),
    },
    {
      field: 'rol',
      label: 'Rol',
      render: row => (
        <Chip
          label={ROLE_LABELS[row.rol] || row.rol}
          color={ROLE_COLORS[row.rol] || 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'tipo_visa',
      label: 'Visa',
      render: row => {
        if (!row.tipo_visa && !row.fecha_vencimiento_visa) {
          return <Typography variant="body2" color="text.disabled">—</Typography>;
        }
        const status = getVisaStatus(row.fecha_vencimiento_visa);
        return (
          <Box>
            <Typography variant="body2">
              {row.tipo_visa || '—'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {status === 'expired' && <Warning fontSize="small" color="error" />}
              {status === 'warning' && <Warning fontSize="small" color="warning" />}
              <Typography
                variant="caption"
                color={status === 'expired' ? 'error.main' : status === 'warning' ? 'warning.main' : 'text.secondary'}
              >
                {formatDate(row.fecha_vencimiento_visa)}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'activo',
      label: 'Estado',
      render: row => (
        <Chip
          label={row.activo ? 'Activo' : 'Inactivo'}
          color={row.activo ? 'success' : 'default'}
          size="small"
          variant={row.activo ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'actions',
      label: 'Acciones',
      align: 'right',
      render: row => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title="Ver detalle">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleView(row);
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {isAdmin && (
            <>
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              {row.activo && (
                <Tooltip title="Desactivar">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeactivating(row);
                    }}
                  >
                    <PersonOff fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </Box>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Usuarios"
        subtitle="Gestión de cuentas de usuario"
        action={isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={handleNew}>
            Nuevo usuario
          </Button>
        )}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* ───────────────────── Tarjetas de estadísticas ───────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={<People />}
            label="Total usuarios"
            value={stats.total}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={<CheckCircle />}
            label="Activos"
            value={stats.activos}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={<Cancel />}
            label="Inactivos"
            value={stats.inactivos}
            color="text.disabled"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={<AdminPanelSettings />}
            label="Administradores"
            value={stats.admins}
            color="error.main"
          />
        </Grid>
      </Grid>

      {/* ───────────────────── Filtros ───────────────────── */}
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
          placeholder="Buscar por nombre, email o teléfono…"
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
        <TextField
          select
          label="Rol"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          size="small"
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">Todos los roles</MenuItem>
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Estado"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          size="small"
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="active">Activos</MenuItem>
          <MenuItem value="inactive">Inactivos</MenuItem>
        </TextField>
      </Paper>

      {/* ───────────────────── Tabla de usuarios ───────────────────── */}
      <DataTable
        columns={columns}
        rows={filteredUsers}
        loading={loading}
        emptyMessage="No hay usuarios que coincidan con los filtros"
        onRowClick={handleView}
      />

      <UserDetailModal
        open={!!viewing}
        onClose={() => setViewing(null)}
        user={viewing}
        onEdit={handleEdit}
        canEdit={isAdmin}
      />
      <UserFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={editing}
        onSaved={load}
      />
      <ConfirmDialog
        open={!!deactivating}
        title="Desactivar usuario"
        message={`¿Desactivar a ${deactivating?.nombre} ${deactivating?.apellido || ''}? El usuario no podrá iniciar sesión.`}
        onConfirm={handleDeactivate}
        onClose={() => setDeactivating(null)}
      />
    </>
  );
}
