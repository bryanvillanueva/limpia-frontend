import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Button, IconButton, Tooltip, TextField, DialogActions, Alert,
  Switch, FormControlLabel, Paper, Typography, Chip, MenuItem,
  Grid, Skeleton, InputAdornment, alpha,
} from '@mui/material';
import {
  Add, Edit, Visibility, Search, Groups, CheckCircle, Cancel, People,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import FormModal from '../../components/ui/FormModal';
import StatusBadge from '../../components/ui/StatusBadge';
import { getTeams, getTeamById, createTeam, updateTeam } from '../../services/teams.service';
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
        <Typography variant="h5" fontWeight={700}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </Paper>
  );
}

export default function TeamsPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Team form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [nombre, setNombre] = useState('');
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const teamsListData = await getTeams();
      const teamsWithMembers = await Promise.all(
        teamsListData.map(team => getTeamById(team.id))
      );
      setTeams(teamsWithMembers);
    } catch {
      setError('Error al cargar equipos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const total = teams.length;
    const activos = teams.filter(t => t.activo).length;
    const inactivos = total - activos;
    const totalMembers = teams.reduce((sum, t) => sum + (t.members?.length || 0), 0);
    return { total, activos, inactivos, totalMembers };
  }, [teams]);

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const q = search.trim().toLowerCase();
      const matchesSearch = !q ||
        (team.numero || '').toLowerCase().includes(q) ||
        (team.members || []).some(
          m => `${m.nombre || ''} ${m.apellido || ''}`.trim().toLowerCase().includes(q)
        );
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && team.activo) ||
        (filterStatus === 'inactive' && !team.activo);
      return matchesSearch && matchesStatus;
    });
  }, [teams, search, filterStatus]);

  const openNew = () => {
    setEditing(null);
    setNombre('');
    setActivo(true);
    setModalOpen(true);
  };

  const openEdit = (team) => {
    setEditing(team);
    setNombre(team.numero ?? '');
    setActivo(Boolean(team.activo));
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateTeam(editing.id, { numero: nombre, activo });
      } else {
        await createTeam({ numero: nombre, activo });
      }
      load();
      setModalOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar equipo');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      field: 'numero',
      label: 'Equipo',
      render: row => (
        <Typography variant="body2" fontWeight={600}>{row.numero}</Typography>
      ),
    },
    {
      field: 'members',
      label: 'Miembros',
      render: row => {
        const members = row.members || [];
        if (members.length === 0) {
          return <Typography variant="body2" color="text.disabled">Sin miembros</Typography>;
        }
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            {members.map(m => (
              <Typography key={m.id} variant="body2">
                {m.nombre} {m.apellido}
              </Typography>
            ))}
          </Box>
        );
      },
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
            <IconButton size="small" onClick={() => navigate(`/equipos/${row.id}`)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {isAdmin && (
            <Tooltip title="Editar">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </>
      ),
    },
  ];

  if (loading) {
    return (
      <>
        <PageHeader title="Equipos" subtitle="Gestión de equipos de trabajo" />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map(i => (
            <Grid size={{ xs: 6, sm: 3 }} key={i}>
              <Skeleton variant="rounded" height={80} />
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
        title="Equipos"
        subtitle="Gestión de equipos de trabajo"
        action={isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={openNew}>
            Nuevo equipo
          </Button>
        )}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* ───────────────────── Stats ───────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={<Groups />} label="Total equipos" value={stats.total} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={<CheckCircle />} label="Activos" value={stats.activos} color="success.main" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={<Cancel />} label="Inactivos" value={stats.inactivos} color="text.disabled" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard icon={<People />} label="Total miembros" value={stats.totalMembers} color="secondary.main" />
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
          placeholder="Buscar por nombre del equipo o miembros…"
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

      {/* ───────────────────── Table ───────────────────── */}
      <DataTable
        columns={columns}
        rows={filteredTeams}
        loading={false}
        onRowClick={(row) => navigate(`/equipos/${row.id}`)}
        emptyMessage={
          search || filterStatus !== 'all'
            ? 'No hay equipos que coincidan con los filtros'
            : 'No hay equipos registrados'
        }
      />

      {/* Create/Edit Team Modal */}
      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar equipo' : 'Nuevo equipo'}
      >
        <form onSubmit={handleSubmit}>
          <TextField
            label="Nombre del equipo"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            fullWidth
            autoFocus
            sx={{ mt: 1, mb: 1 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={activo}
                onChange={e => setActivo(e.target.checked)}
                color="primary"
              />
            }
            label="Activo"
            sx={{ ml: 0 }}
          />
          <DialogActions sx={{ px: 0, pt: 2 }}>
            <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </DialogActions>
        </form>
      </FormModal>
    </>
  );
}
