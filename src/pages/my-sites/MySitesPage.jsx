import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  IconButton, Tooltip, Alert, Box, Typography,
  Paper, TextField, InputAdornment, Chip,
} from '@mui/material';
import { Visibility, Search, LocationOn, Schedule, AccessTime } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import { getMySites } from '../../services/sites.service';

/**
 * MySitesPage — Shows the cleaner's team-assigned sites in a searchable table.
 * Read-only view (no admin actions like edit/deactivate).
 * Uses GET /sites/my-sites which returns sites scoped to the user's active team.
 */
export default function MySitesPage() {
  const navigate = useNavigate();

  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSites(await getMySites());
    } catch {
      setError('Error al cargar tus sitios asignados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /**
   * Filters sites by search query matching address fields.
   */
  const filteredSites = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sites;

    return sites.filter(site => {
      const addressFields = [
        site.direccion_linea1,
        site.direccion_linea2,
        site.suburb,
        site.state,
        site.postcode,
        site.country,
      ].filter(Boolean).join(' ').toLowerCase();

      return addressFields.includes(q);
    });
  }, [sites, search]);

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
      field: 'frecuencia',
      label: 'Frecuencia',
      render: row => row.frecuencia
        ? <Chip label={row.frecuencia} size="small" variant="outlined" icon={<Schedule sx={{ fontSize: 14 }} />} />
        : '—',
    },
    {
      field: 'horas_por_trabajador',
      label: 'Horas',
      render: row => row.horas_por_trabajador != null
        ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2">{row.horas_por_trabajador}h</Typography>
          </Box>
        )
        : '—',
    },
    {
      field: 'hace_bins',
      label: 'Bins',
      render: row => row.hace_bins
        ? <Chip label={row.pago_bins != null ? `$${row.pago_bins}` : 'Sí'} size="small" color="success" />
        : '—',
    },
    {
      field: 'actions',
      label: '',
      align: 'right',
      render: row => (
        <Tooltip title="Ver detalle">
          <IconButton size="small" onClick={() => navigate(`/sitios/${row.id}`)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Mis Sitios" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && sites.length > 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LocationOn color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            {sites.length} {sites.length === 1 ? 'sitio asignado' : 'sitios asignados'} a tu equipo
          </Typography>
        </Box>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
        }}
      >
        <TextField
          placeholder="Buscar por dirección…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280, flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Paper>

      <DataTable
        columns={columns}
        rows={filteredSites}
        loading={loading}
        emptyMessage={search ? 'No hay sitios que coincidan con tu búsqueda' : 'No tienes sitios asignados por el momento'}
      />
    </>
  );
}
