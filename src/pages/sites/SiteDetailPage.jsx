import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, Paper, IconButton, Button,
  TextField, Alert, List, ListItem, ListItemText, Divider,
  Chip, Grid, Skeleton, Avatar, alpha,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { ArrowBack, LocationOn, Business, Assignment, AttachMoney, Groups, Send, History, Comment, Map, Public, Edit as EditIcon, Add, CleaningServices, DeleteOutline, Tune, AccessTime } from '@mui/icons-material';
import { getSiteById, getSiteComments, addSiteComment, getSiteLogs, getSiteAssignments } from '../../services/sites.service';
import { getMyLogs } from '../../services/logs.service';
import { getTeams } from '../../services/teams.service';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import SiteMap from '../../components/ui/SiteMap';
import AssignmentFormModal from './AssignmentFormModal';
import DetailHeader from '../../components/ui/DetailHeader';
import StatsRow from '../../components/ui/StatsRow';

const ENTRY_META = {
  SERVICE: { label: 'Service', tone: 'success', icon: <CleaningServices fontSize="small" /> },
  BINS:    { label: 'Bins',    tone: 'info',    icon: <DeleteOutline fontSize="small" /> },
  CUSTOM:  { label: 'Otro',    tone: 'warning', icon: <Tune fontSize="small" /> },
};

const trimNumber = (n) => Number(n).toFixed(2).replace(/\.?0+$/, '') || '0';

/** Value of a log: hours for SERVICE, money for BINS, free number for CUSTOM. */
function logValue(l) {
  const v = Number(l.display_value ?? l.horas_trabajadas ?? 0);
  if (l.entry_type === 'BINS') return `$${v.toFixed(2)}`;
  if (l.entry_type === 'CUSTOM') return trimNumber(v);
  return `${trimNumber(v)} h`;
}

function fmtLogDate(raw) {
  const [y, m, d] = String(raw || '').slice(0, 10).split('-').map(Number);
  if (!y) return '—';
  return new Date(y, m - 1, d).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Activity of a site: summary cards plus one row per log with its type, value,
 * status, date, who did it (admin view) and the observations written at the time.
 */
function SiteLogHistory({ logs, showCleaner }) {
  const type = (l) => l.entry_type || 'SERVICE';
  const services = logs.filter((l) => type(l) === 'SERVICE');
  const hours = services.reduce((s, l) => s + Number(l.display_value ?? l.horas_trabajadas ?? 0), 0);
  const binsCount = logs.filter((l) => type(l) === 'BINS').length;

  return (
    <>
      <StatsRow
        items={[
          { icon: <CleaningServices />, label: 'Visitas de servicio', value: services.length },
          { icon: <AccessTime />, label: 'Horas registradas', value: trimNumber(hours), tone: 'success' },
          { icon: <DeleteOutline />, label: 'Bins', value: binsCount, tone: 'info' },
        ]}
      />
      <Box>
        {logs.map((l, i) => {
          const meta = ENTRY_META[type(l)] || ENTRY_META.SERVICE;
          const who = [l.limpiador, l.limpiador_apellido].filter(Boolean).join(' ');
          const details = [fmtLogDate(l.fecha || l.created_at), showCleaner && who, showCleaner && l.team_numero && `Equipo ${l.team_numero}`]
            .filter(Boolean).join(' · ');
          return (
            <Box
              key={l.id || i}
              sx={{ display: 'flex', gap: 2, py: 1.75, borderTop: i > 0 ? '1px solid' : 'none', borderColor: 'divider' }}
            >
              <Box
                sx={{
                  width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: (t) => alpha(t.palette[meta.tone].main, 0.12),
                  color: `${meta.tone}.main`,
                }}
              >
                {meta.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" fontWeight={700}>{meta.label}</Typography>
                  <Typography variant="body2" fontWeight={700} color={`${meta.tone}.main`}>{logValue(l)}</Typography>
                  <StatusBadge value={l.estado || 'pendiente'} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'none', letterSpacing: 0, mt: 0.25 }}>
                  {details}
                </Typography>
                {l.observaciones && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.75, px: 1.25, py: 0.75, borderRadius: 1.5, bgcolor: 'action.hover', whiteSpace: 'pre-wrap' }}
                  >
                    {l.observaciones}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </>
  );
}

/**
 * TabPanel - Renderiza contenido condicionalmente según el tab activo.
 */
function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

/**
 * InfoRow - Muestra un campo clave-valor con icono.
 * Diseñado para mostrar detalles del sitio de forma compacta.
 */
function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
      <Box sx={{ color: 'text.secondary', display: 'flex', flexShrink: 0 }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500} noWrap>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * SiteDetailPage - Página de detalle de un sitio.
 * Muestra mapa de ubicación, información, asignar equipos, comentarios y logs.
 */
export default function SiteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';
  const isCleaner = user?.rol === 'cleaner';
  const backPath = isCleaner ? '/mis-sitios' : '/sitios';

  const [tab, setTab] = useState(0);
  const [site, setSite] = useState(null);
  const [comments, setComments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (isCleaner) {
        const [s, c, myLogs] = await Promise.all([
          getSiteById(id),
          getSiteComments(id),
          getMyLogs({ site_id: id }),
        ]);
        setSite(s);
        setComments(c);
        setLogs(myLogs);
      } else {
        const adminPromises = isAdmin ? [getTeams()] : [];
        const [s, c, a, l, ...rest] = await Promise.all([
          getSiteById(id),
          getSiteComments(id),
          getSiteAssignments(id),
          getSiteLogs(id),
          ...adminPromises,
        ]);
        setSite(s);
        setComments(c);
        setAssignments(a);
        setLogs(l);
        if (isAdmin) setTeams(rest[0].filter(team => team.activo));
      }
    } catch {
      setError('Error al cargar el sitio');
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin, isCleaner]);

  useEffect(() => { load(); }, [load]);

  /**
   * Maneja el envío de un nuevo comentario.
   */
  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await addSiteComment(id, newComment);
      setNewComment('');
      const c = await getSiteComments(id);
      setComments(c);
    } catch {
      setError('Error al agregar comentario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenNewAssignment = () => {
    setEditingAssignment(null);
    setAssignModalOpen(true);
  };

  const handleEditAssignment = (a) => {
    setEditingAssignment(a);
    setAssignModalOpen(true);
  };

  const handleAssignmentSaved = () => {
    setSuccess('Asignación guardada correctamente');
    load();
  };

  /**
   * Construye la dirección completa para geocodificación y display.
   */
  const formatFullAddress = () => {
    if (!site) return '';
    const parts = [site.direccion_linea1, site.direccion_linea2].filter(Boolean);
    const location = [site.suburb, site.state, site.postcode].filter(Boolean).join(' ');
    if (location) parts.push(location);
    if (site.country) parts.push(site.country);
    return parts.join(', ');
  };

  /**
   * Formatea una fecha para mostrar con hora.
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={32} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Skeleton variant="rounded" height={340} />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Skeleton variant="rounded" height={340} />
          </Grid>
        </Grid>
        <Skeleton variant="rounded" height={200} sx={{ mt: 3 }} />
      </>
    );
  }

  if (!site) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Sitio no encontrado</Typography>
        <Button onClick={() => navigate(backPath)} sx={{ mt: 2 }}>
          Volver a sitios
        </Button>
      </Paper>
    );
  }

  const fullAddress = formatFullAddress();

  return (
    <>
      {/* Header */}
      <DetailHeader
        onBack={() => navigate(backPath)}
        icon={<LocationOn />}
        title={site.direccion_linea1}
        chips={<StatusBadge value={site.activo ? 'activo' : 'inactivo'} />}
        subtitle={[site.suburb, site.state, site.postcode, site.country].filter(Boolean).join(', ')}
        action={!isCleaner && site.cliente_nombre && (
          <Chip
            icon={<Business sx={{ fontSize: 16 }} />}
            label={site.cliente_nombre}
            variant="outlined"
          />
        )}
      />

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Map with overlaid info card */}
      <Box sx={{ position: 'relative', mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <SiteMap
          address={fullAddress}
          lat={site.latitud ? Number(site.latitud) : null}
          lng={site.longitud ? Number(site.longitud) : null}
          height={{ xs: 280, sm: 420 }}
        />
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1,
            width: { xs: 'calc(100% - 32px)', sm: 320 },
            p: 2.5,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            Información del sitio
          </Typography>

          <Divider sx={{ mb: 1.5 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <InfoRow
              icon={<LocationOn fontSize="small" />}
              label="Dirección"
              value={fullAddress}
            />
            {site.suburb && (
              <InfoRow
                icon={<Map fontSize="small" />}
                label="Suburb"
                value={site.suburb}
              />
            )}
            {site.state && (
              <InfoRow
                icon={<Public fontSize="small" />}
                label="Estado / Región"
                value={`${site.state}${site.postcode ? ` ${site.postcode}` : ''}`}
              />
            )}
            {site.country && (
              <InfoRow
                icon={<Public fontSize="small" />}
                label="País"
                value={site.country}
              />
            )}

            {!isCleaner && (
              <>
                <Divider sx={{ my: 1 }} />
                <InfoRow
                  icon={<Business fontSize="small" />}
                  label="Cliente"
                  value={site.cliente_nombre}
                />
                <InfoRow
                  icon={<Assignment fontSize="small" />}
                  label="Contrato"
                  value={site.contrato}
                />
                <InfoRow
                  icon={<AttachMoney fontSize="small" />}
                  label="Finanzas"
                  value={site.finanzas}
                />
              </>
            )}
          </Box>

          {(site.latitud || site.longitud) && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Coordenadas: {site.latitud}, {site.longitud}
              </Typography>
            </>
          )}
        </Paper>
      </Box>

      {/* Tabs section */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { minHeight: 56 },
          }}
        >
          {!isCleaner && <Tab icon={<Groups />} iconPosition="start" label={`Equipos (${assignments.length})`} />}
          <Tab icon={<Comment />} iconPosition="start" label={`Comentarios (${comments.length})`} />
          <Tab icon={<History />} iconPosition="start" label={`${isCleaner ? 'Mi Historial' : 'Historial'} (${logs.length})`} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* Tab: Equipos (non-cleaner only) */}
          {!isCleaner && (
            <TabPanel value={tab} index={0}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Equipos asignados ({assignments.length})
                </Typography>
                {isAdmin && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={handleOpenNewAssignment}
                  >
                    Nueva asignación
                  </Button>
                )}
              </Box>
              {assignments.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No hay equipos asignados a este sitio.
                  </Typography>
                </Paper>
              ) : (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Equipo</TableCell>
                        <TableCell>Miembros</TableCell>
                        <TableCell>Frecuencia</TableCell>
                        <TableCell>Horas/trabajador</TableCell>
                        <TableCell>Bins</TableCell>
                        <TableCell>Fecha inicio</TableCell>
                        {isAdmin && <TableCell align="right">Acciones</TableCell>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {assignments.map((a) => (
                        <TableRow key={a.team_id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {a.team_numero}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {a.members.length > 0
                                ? a.members.map(m => m.nombre).join(', ')
                                : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>{a.frecuencia || '—'}</TableCell>
                          <TableCell>{a.horas_por_trabajador ?? '—'}</TableCell>
                          <TableCell>
                            {a.hace_bins
                              ? <Chip label={a.pago_bins != null ? `$${a.pago_bins}` : 'Sí'} size="small" color="success" />
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {a.fecha_asignacion
                              ? new Date(a.fecha_asignacion).toLocaleDateString('es-AU')
                              : '—'}
                          </TableCell>
                          {isAdmin && (
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleEditAssignment(a)}
                                title="Editar asignación"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </TabPanel>
          )}

          {/* Tab: Comentarios — index 0 for cleaners, 1 for non-cleaners */}
          <TabPanel value={tab} index={isCleaner ? 0 : 1}>
            <Box
              component="form"
              onSubmit={handleComment}
              sx={{ display: 'flex', gap: 1, mb: 3 }}
            >
              <TextField
                size="small"
                placeholder="Escribe un comentario…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                sx={{ flex: 1 }}
                multiline
                maxRows={3}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !newComment.trim()}
                startIcon={<Send />}
                sx={{ alignSelf: 'flex-end' }}
              >
                {submitting ? 'Enviando…' : 'Enviar'}
              </Button>
            </Box>

            {comments.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover' }}
              >
                <Typography variant="body2" color="text.secondary">
                  No hay comentarios aún. Sé el primero en comentar.
                </Typography>
              </Paper>
            ) : (
              <List disablePadding>
                {comments.map((c, i) => (
                  <Box key={c.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 1.5,
                          bgcolor: 'primary.main',
                          fontSize: 14,
                        }}
                      >
                        {c.autor?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {c.autor || 'Usuario'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(c.created_at)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {c.comentario}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {i < comments.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </List>
            )}
          </TabPanel>

          {/* Tab: Historial — index 1 for cleaners, 2 for non-cleaners */}
          <TabPanel value={tab} index={isCleaner ? 1 : 2}>
            {logs.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{ p: 3, textAlign: 'center', bgcolor: 'action.hover' }}
              >
                <Typography variant="body2" color="text.secondary">
                  {isCleaner
                    ? 'Aún no tienes registros en este sitio.'
                    : 'No hay registros de historial para este sitio.'}
                </Typography>
              </Paper>
            ) : (
              <SiteLogHistory logs={logs} showCleaner={!isCleaner} />
            )}
          </TabPanel>
        </Box>
      </Paper>

      {isAdmin && (
        <AssignmentFormModal
          open={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          siteId={id}
          teams={teams}
          assignment={editingAssignment}
          onSaved={handleAssignmentSaved}
        />
      )}
    </>
  );
}
