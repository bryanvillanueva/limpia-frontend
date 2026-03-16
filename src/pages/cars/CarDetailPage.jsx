/**
 * Car detail page.
 * Shows full car information and the service history table (car_services).
 * Allows admins to add new service records and edit the car.
 * "version" is displayed as "Año" per business rule.
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, IconButton, Button, Chip, Grid, Skeleton, Alert, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  ArrowBack, Edit, Add, DirectionsCar, Build, CalendarMonth,
  Speed, AttachMoney, Notes, Groups, Security, Settings,
} from '@mui/icons-material';
import { getCarById, getCarServices } from '../../services/cars.service';
import { getTeamById } from '../../services/teams.service';
import { useAuth } from '../../context/AuthContext';
import CarFormModal from './CarFormModal';
import CarServiceFormModal from './CarServiceFormModal';

/**
 * Formats an ISO / date string to a short localised date.
 * @param {string|null} dateStr - Raw date string.
 * @returns {string} Formatted date or dash.
 */
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-AU', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

/**
 * Reusable info row for the car detail section.
 * @param {Object} props - icon, label, value.
 */
function InfoRow({ icon: Icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1 }}>
      <Icon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.25 }} />
      <Box>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={500}>{value || '—'}</Typography>
      </Box>
    </Box>
  );
}

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';

  const [car, setCar] = useState(null);
  const [services, setServices] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [carData, svcData] = await Promise.all([
        getCarById(id),
        getCarServices(id),
      ]);
      setCar(carData);
      setServices(Array.isArray(svcData) ? svcData : []);

      if (carData?.equipo_id) {
        try {
          const teamData = await getTeamById(carData.equipo_id);
          setTeam(teamData);
        } catch {
          setTeam(null);
        }
      } else {
        setTeam(null);
      }
    } catch {
      setError('Error al cargar el vehículo');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={32} />
            <Skeleton variant="text" width="25%" height={20} />
          </Box>
        </Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={320} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={320} /></Grid>
        </Grid>
        <Skeleton variant="rounded" height={200} sx={{ mt: 3 }} />
      </>
    );
  }

  /* ---------- Not found ---------- */
  if (!car) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Vehículo no encontrado</Typography>
        <Button onClick={() => navigate('/vehiculos')} sx={{ mt: 2 }}>Volver a vehículos</Button>
      </Paper>
    );
  }

  const carTitle = [car.marca, car.modelo, car.version].filter(Boolean).join(' ');
  const equipoNumero = car.equipo_numero || team?.numero;

  return (
    <>
      {/* ===== Header ===== */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/vehiculos')} sx={{ mt: 0.5 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            <DirectionsCar color="primary" />
            <Typography variant="h5" fontWeight={700}>{car.matricula}</Typography>
            {car.tipo && <Chip label={car.tipo} size="small" variant="outlined" />}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {carTitle || 'Sin detalles de marca/modelo'}
            {equipoNumero && ` · Equipo ${equipoNumero}`}
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => setEditOpen(true)}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Editar
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* ===== Car info panels ===== */}
      <Grid container spacing={3}>
        {/* General info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCar fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight={700}>Información del vehículo</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <InfoRow icon={DirectionsCar} label="Matrícula" value={car.matricula} />
              <Divider />
              <InfoRow icon={Settings} label="Tipo" value={car.tipo} />
              <Divider />
              <InfoRow
                icon={DirectionsCar}
                label="Marca / Modelo"
                value={[car.marca, car.modelo].filter(Boolean).join(' ') || null}
              />
              <Divider />
              <InfoRow icon={CalendarMonth} label="Año" value={car.version} />
              <Divider />
              {equipoNumero ? (
                <Box
                  onClick={() => navigate(`/equipos/${car.equipo_id}`)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, mx: -0.5, px: 0.5 }}
                >
                  <InfoRow icon={Groups} label="Equipo asignado" value={equipoNumero} />
                </Box>
              ) : (
                <InfoRow icon={Groups} label="Equipo asignado" value={null} />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Dates, insurance, notes */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Build fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight={700}>Mantenimiento y seguro</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <InfoRow icon={CalendarMonth} label="Próximo mantenimiento" value={fmtDate(car.proximo_mantenimiento_fecha)} />
              <Divider />
              <InfoRow icon={CalendarMonth} label="Fecha Rego" value={fmtDate(car.fecha_rego)} />
              <Divider />
              <InfoRow icon={Security} label="Seguro" value={car.seguro_info} />
              <Divider />
              <InfoRow icon={Notes} label="Características" value={car.caracteristicas} />
              <Divider />
              <InfoRow icon={Notes} label="Comentarios" value={car.comentarios} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ===== Service history ===== */}
      <Paper
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mt: 3 }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Build fontSize="small" color="primary" />
            <Typography variant="subtitle2" fontWeight={700}>
              Historial de servicios ({services.length})
            </Typography>
          </Box>
          {isAdmin && (
            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={() => setServiceOpen(true)}
            >
              Registrar servicio
            </Button>
          )}
        </Box>

        {services.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Sin registros de servicio
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Km</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Equipo</TableCell>
                  <TableCell>Snapshot vehículo</TableCell>
                  <TableCell>Notas</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((svc) => (
                  <TableRow key={svc.id} hover>
                    <TableCell>{fmtDate(svc.fecha_mantenimiento)}</TableCell>
                    <TableCell>
                      {svc.km_mantenimiento != null ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Speed sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {Number(svc.km_mantenimiento).toLocaleString()} km
                          </Typography>
                        </Box>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      {svc.precio != null ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AttachMoney sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {Number(svc.precio).toLocaleString('en-AU', { minimumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                      ) : '—'}
                    </TableCell>
                    <TableCell>
                      {svc.equipo_numero
                        ? <Chip label={svc.equipo_numero} size="small" variant="outlined" />
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {[svc.car_marca, svc.car_modelo, svc.car_version].filter(Boolean).join(' ') || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {svc.notas || '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* ===== Modals ===== */}
      <CarFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        car={car}
        onSaved={load}
      />
      <CarServiceFormModal
        open={serviceOpen}
        onClose={() => setServiceOpen(false)}
        carId={car.id}
        onSaved={load}
      />
    </>
  );
}
