import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Button, IconButton, Tooltip, Alert, Box, Typography,
  Paper, TextField, InputAdornment, MenuItem, Grid, Chip, alpha,
} from '@mui/material';
import { Add, Edit, Visibility, Block, Upload, Search, LocationOn, CheckCircle, Cancel, Groups } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import SiteFormModal from './SiteFormModal';
import SiteImportModal from './SiteImportModal';
import { getSites, deactivateSite } from '../../services/sites.service';
import { getClients } from '../../services/clients.service';
import { getTeams } from '../../services/teams.service';
import { useAuth } from '../../context/AuthContext';

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

export default function SitesPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';
  const navigate = useNavigate();

  const [sites, setSites] = useState([]);
  const [clients, setClients] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deactivating, setDeactivating] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, c, t] = await Promise.all([getSites(), getClients(), getTeams()]);
      setSites(s);
      setClients(c);
      setTeams(t.filter((team) => team.activo));
    } catch { setError('Error al cargar sitios'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeactivate = async () => {
    try { await deactivateSite(deactivating.id); load(); }
    catch { setError('Error al desactivar'); }
    setDeactivating(null);
  };

  /**
   * Filtra sitios por búsqueda (dirección, cliente) y estado.
   */
  const filteredSites = useMemo(() => {
    return sites.filter(site => {
      const q = search.trim().toLowerCase();
      const addressFields = [
        site.direccion_linea1,
        site.direccion_linea2,
        site.suburb,
        site.state,
        site.postcode,
        site.country,
      ].filter(Boolean).join(' ').toLowerCase();

      const matchesSearch = !q ||
        addressFields.includes(q) ||
        (site.cliente_nombre || '').toLowerCase().includes(q);

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && site.activo) ||
        (filterStatus === 'inactive' && !site.activo);

      return matchesSearch && matchesStatus;
    });
  }, [sites, search, filterStatus]);

  const columns = [
    {
      field: 'direccion_linea1',
      label: 'Dirección',
      render: row => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.direccion_linea1 || '—'}
          </Typography>
          {(row.suburb || row.state) && (
            <Typography variant="caption" color="text.secondary">
              {[row.suburb, row.state, row.postcode].filter(Boolean).join(', ')}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'equipos',
      label: 'Equipos',
      render: row => row.equipos
        ? (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {row.equipos.split(', ').map(num => (
              <Chip key={num} label={num} size="small" variant="outlined" icon={<Groups sx={{ fontSize: 14 }} />} />
            ))}
          </Box>
        )
        : <Typography variant="body2" color="text.disabled">—</Typography>,
    },
    {
      field: 'cliente_nombre',
      label: 'Cliente',
      render: row => row.cliente_nombre || '—',
    },
    {
      field: 'activo',
      label: 'Estado',
      render: row => <StatusBadge value={row.activo ? 'activo' : 'inactivo'} />,
    },
    {
      field: 'actions',
      label: 'Acciones',
      align: 'right',
      render: row => (
        <>
          <Tooltip title="Ver detalle">
            <IconButton size="small" onClick={() => navigate(`/sitios/${row.id}`)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {isAdmin && (
            <>
              <Tooltip title="Editar">
                <IconButton size="small" onClick={() => { setEditing(row); setModalOpen(true); }}>
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
              {row.activo && (
                <Tooltip title="Desactivar">
                  <IconButton size="small" color="error" onClick={() => setDeactivating(row)}>
                    <Block fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Sitios"
        action={isAdmin && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Upload />} onClick={() => setImportModalOpen(true)}>
              Importar Sitios
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={() => { setEditing(null); setModalOpen(true); }}>
              Nuevo sitio
            </Button>
          </Box>
        )}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ───────────────────── Stats ───────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard icon={<LocationOn />} label="Total sitios" value={sites.length} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard icon={<CheckCircle />} label="Activos" value={sites.filter(s => s.activo).length} color="success.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <StatCard icon={<Cancel />} label="Inactivos" value={sites.filter(s => !s.activo).length} color="error.main" />
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
          placeholder="Buscar por dirección, suburb, estado o cliente…"
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

      <DataTable
        columns={columns}
        rows={filteredSites}
        loading={loading}
        emptyMessage={search || filterStatus !== 'all' ? 'No hay sitios que coincidan con los filtros' : 'No hay sitios registrados'}
      />
      <SiteFormModal open={modalOpen} onClose={() => setModalOpen(false)} site={editing} clients={clients} teams={teams} onSaved={load} />
      <ConfirmDialog
        open={!!deactivating}
        title="Desactivar sitio"
        message={`¿Desactivar el sitio "${deactivating?.direccion_linea1}"?`}
        onConfirm={handleDeactivate}
        onClose={() => setDeactivating(null)}
      />
      <SiteImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={load}
      />
    </>
  );
}
