/**
 * Cars listing page.
 * Displays all vehicles with key columns: Matrícula, Tipo, Marca/Modelo, Año,
 * Equipo, Próx. Mantenimiento, and actions (edit / view detail).
 * Table fields map to the `cars` DB table; "version" is shown as "Año".
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Button, IconButton, Tooltip, Alert, Typography, Paper, TextField,
  InputAdornment, MenuItem, Box, Chip,
} from '@mui/material';
import { Add, Edit, Visibility, Search, DirectionsCar } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import CarFormModal from './CarFormModal';
import { getCars } from '../../services/cars.service';
import { useAuth } from '../../context/AuthContext';

/**
 * Formats an ISO / date string to a short localised date (dd MMM yyyy).
 * @param {string|null} dateStr - Raw date value.
 * @returns {string} Formatted date or dash.
 */
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-AU', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export default function CarsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.rol === 'admin';

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setCars(await getCars()); }
    catch { setError('Error al cargar vehículos'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredCars = useMemo(() => {
    let list = cars;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        (c.matricula || '').toLowerCase().includes(q) ||
        (c.marca || '').toLowerCase().includes(q) ||
        (c.modelo || '').toLowerCase().includes(q) ||
        (c.version || '').toString().includes(q) ||
        (c.equipo_numero || '').toString().toLowerCase().includes(q),
      );
    }
    if (filterTipo) {
      list = list.filter((c) => c.tipo === filterTipo);
    }
    return list;
  }, [cars, search, filterTipo]);

  const tipos = useMemo(
    () => [...new Set(cars.map((c) => c.tipo).filter(Boolean))],
    [cars],
  );

  const columns = [
    {
      field: 'matricula',
      label: 'Matrícula',
      render: (row) => (
        <Typography variant="body2" fontWeight={600}>{row.matricula}</Typography>
      ),
    },
    {
      field: 'tipo',
      label: 'Tipo',
      render: (row) =>
        row.tipo
          ? <Chip label={row.tipo} size="small" variant="outlined" />
          : '—',
    },
    {
      field: 'marca',
      label: 'Marca / Modelo',
      render: (row) => {
        const parts = [row.marca, row.modelo].filter(Boolean).join(' ');
        return parts || '—';
      },
    },
    {
      field: 'version',
      label: 'Año',
      render: (row) => row.version || '—',
    },
    {
      field: 'equipo_numero',
      label: 'Equipo',
      render: (row) =>
        row.equipo_numero
          ? <Chip label={row.equipo_numero} size="small" color="primary" variant="outlined" />
          : '—',
    },
    {
      field: 'proximo_mantenimiento_fecha',
      label: 'Próx. Mantenimiento',
      render: (row) => fmtDate(row.proximo_mantenimiento_fecha),
    },
    {
      field: 'fecha_rego',
      label: 'Rego',
      render: (row) => fmtDate(row.fecha_rego),
    },
    {
      field: 'actions',
      label: 'Acciones',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Ver detalle">
            <IconButton size="small" onClick={() => navigate(`/vehiculos/${row.id}`)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {isAdmin && (
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
          )}
        </Box>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Vehículos"
        subtitle="Gestión de vehículos de la empresa"
        action={
          isAdmin && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => { setEditing(null); setModalOpen(true); }}
            >
              Nuevo vehículo
            </Button>
          )
        }
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Search & filter bar */}
      <Paper
        elevation={0}
        sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
      >
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Buscar por matrícula, marca, modelo, año o equipo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 240 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            select
            size="small"
            label="Tipo"
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {tipos.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Paper>

      <DataTable
        columns={columns}
        rows={filteredCars}
        loading={loading}
        emptyMessage={search || filterTipo ? 'Sin resultados para la búsqueda' : 'No hay vehículos registrados'}
        onRowClick={(row) => navigate(`/vehiculos/${row.id}`)}
      />

      <CarFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        car={editing}
        onSaved={load}
      />
    </>
  );
}
