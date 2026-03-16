import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Tabs, Tab, Paper, IconButton, Button,
  TextField, Alert, List, ListItem, ListItemText, Divider,
  Chip, Grid, Skeleton, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  ArrowBack, LocationOn, Business, Assignment, AttachMoney,
  Groups, Send, History, Comment, Map, Public, Edit as EditIcon, Add,
} from '@mui/icons-material';
import { getSiteById, getSiteComments, addSiteComment, getSiteLogs, getSiteAssignments } from '../../services/sites.service';
import { getMyLogs } from '../../services/logs.service';
import { getTeams } from '../../services/teams.service';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import SiteMap from '../../components/ui/SiteMap';
import AssignmentFormModal from './AssignmentFormModal';

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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(backPath)} sx={{ mt: 0.5 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="h5" fontWeight={700} noWrap sx={{ minWidth: 0 }}>
              {site.direccion_linea1}
            </Typography>
            <StatusBadge value={site.activo ? 'activo' : 'inactivo'} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {[site.suburb, site.state, site.postcode, site.country].filter(Boolean).join(', ')}
          </Typography>
        </Box>
        {!isCleaner && site.cliente_nombre && (
          <Chip
            icon={<Business sx={{ fontSize: 16 }} />}
            label={site.cliente_nombre}
            variant="outlined"
            sx={{ flexShrink: 0 }}
          />
        )}
      </Box>

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
          height={420}
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
              <List disablePadding>
                {logs.map((l, i) => (
                  <Box key={l.id || i}>
                    <ListItem sx={{ px: 0 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: l.confirmado ? 'success.main' : 'warning.main',
                          mr: 2,
                          flexShrink: 0,
                        }}
                      />
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" fontWeight={600}>
                              {l.accion || l.limpiador || 'Actividad'}
                            </Typography>
                            {l.confirmado && (
                              <Chip label="Confirmado" size="small" color="success" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(l.fecha || l.created_at)}
                              {l.usuario && ` • ${l.usuario}`}
                            </Typography>
                            {(l.horas || l.bins || l.notas || l.detalles) && (
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {l.horas && `Horas: ${l.horas}`}
                                {l.bins && ` • Bins: ${l.bins}`}
                                {(l.notas || l.detalles) && ` • ${l.notas || l.detalles}`}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {i < logs.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </List>
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
