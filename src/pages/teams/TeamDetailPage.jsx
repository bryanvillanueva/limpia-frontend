import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, IconButton, Button, Chip, Avatar, Divider,
  Grid, Skeleton, Alert, Tab, Tabs, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  List, ListItem, ListItemAvatar, ListItemText, Autocomplete,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  ArrowBack, Groups, Person, LocationOn, DirectionsCar, Email,
  Phone, Home, Badge, CalendarMonth, Schedule, Business,
  Build, Security, Notes, Settings, Construction, Search,
  CheckCircle, Cancel, Add, PersonRemove,
} from '@mui/icons-material';
import { getTeamById, getTeamPortfolio, getTeamCars, getTeamTools, addTeamMember, removeTeamMember } from '../../services/teams.service';
import { getUsers } from '../../services/users.service';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.rol === 'admin';

  const [team, setTeam] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [cars, setCars] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bottomTab, setBottomTab] = useState(0);
  const [bottomSearch, setBottomSearch] = useState('');

  /* ── Add member state ── */
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addingSaving, setAddingSaving] = useState(false);

  /* ── Remove member state ── */
  const [removeTarget, setRemoveTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p, c, tl] = await Promise.all([
        getTeamById(id),
        getTeamPortfolio(id),
        getTeamCars(id),
        getTeamTools(id),
      ]);
      setTeam(t);
      setPortfolio(p);
      setCars(c);
      setTools(tl);
    } catch {
      setError('Error al cargar el equipo');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleOpenAddMember = async () => {
    setAddMemberOpen(true);
    setSelectedUser(null);
    try {
      const users = await getUsers();
      setAllUsers(users);
    } catch {
      setError('Error al cargar usuarios');
    }
  };

  const availableUsers = useMemo(() => {
    const memberIds = new Set((team?.members || []).map(m => m.id));
    return allUsers.filter(u => !memberIds.has(u.id));
  }, [allUsers, team]);

  const handleAddMember = async () => {
    if (!selectedUser) return;
    setAddingSaving(true);
    try {
      await addTeamMember(id, selectedUser.id);
      setAddMemberOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al agregar miembro');
    } finally {
      setAddingSaving(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removeTarget) return;
    try {
      await removeTeamMember(id, removeTarget.id);
      setRemoveTarget(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al remover miembro');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-AU', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

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
          <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={260} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><Skeleton variant="rounded" height={260} /></Grid>
        </Grid>
        <Skeleton variant="rounded" height={200} sx={{ mt: 3 }} />
      </>
    );
  }

  if (!team) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Equipo no encontrado</Typography>
        <Button onClick={() => navigate('/equipos')} sx={{ mt: 2 }}>Volver a equipos</Button>
      </Paper>
    );
  }

  const members = team.members || [];

  return (
    <>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/equipos')} sx={{ mt: 0.5 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="h5" fontWeight={700}>
              {team.numero}
            </Typography>
            <StatusBadge value={team.activo ? 'activo' : 'inactivo'} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {members.length}/2 miembros &middot; {portfolio.length} sitios asignados &middot; {cars.length} vehículos &middot; {tools.length} herramientas
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

      <Grid container spacing={3}>
        {/* Members section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
                Miembros ({members.length}/2)
              </Typography>
              {isAdmin && members.length < 2 && (
                <Button size="small" startIcon={<Add />} onClick={handleOpenAddMember} sx={{ textTransform: 'none' }}>
                  Agregar
                </Button>
              )}
            </Box>
            <Box sx={{ p: 2 }}>
              {members.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Sin miembros asignados
                </Typography>
              ) : (
                <List disablePadding>
                  {members.map((m, idx) => (
                    <Box key={m.id}>
                      {idx > 0 && <Divider sx={{ my: 1.5 }} />}
                      <ListItem disablePadding sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <ListItemAvatar sx={{ minWidth: 48 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, fontSize: 15 }}>
                              {m.nombre?.[0]}{m.apellido?.[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight={600}>
                                {m.nombre} {m.apellido}
                              </Typography>
                            }
                            secondary={
                              <Chip label={m.rol} size="small" sx={{ height: 20, fontSize: '0.7rem', mt: 0.5 }} />
                            }
                            sx={{ my: 0, flex: 1 }}
                          />
                          {isAdmin && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setRemoveTarget(m)}
                              sx={{ ml: 1 }}
                            >
                              <PersonRemove fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                        <Box sx={{ pl: 6, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {m.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Email sx={{ fontSize: 15, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">{m.email}</Typography>
                            </Box>
                          )}
                          {m.telefono && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Phone sx={{ fontSize: 15, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">{m.telefono}</Typography>
                            </Box>
                          )}
                          {m.direccion && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Home sx={{ fontSize: 15, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">{m.direccion}</Typography>
                            </Box>
                          )}
                          {m.tipo_visa && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Badge sx={{ fontSize: 15, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">{m.tipo_visa}</Typography>
                            </Box>
                          )}
                          {m.fecha_vencimiento_visa && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarMonth sx={{ fontSize: 15, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Vence: {formatDate(m.fecha_vencimiento_visa)}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Vehicles section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCar fontSize="small" color="primary" />
              <Typography variant="subtitle2" fontWeight={700}>
                Vehículos ({cars.length})
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {cars.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Sin vehículos asignados
                </Typography>
              ) : (
                cars.map((car, idx) => (
                  <Box key={car.id}>
                    {idx > 0 && <Divider sx={{ my: 2 }} />}
                    <Box
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, p: 1, mx: -1 }}
                      onClick={() => navigate(`/vehiculos/${car.id}`)}
                    >
                      {/* Plate + type + brand/model/year */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
                          <DirectionsCar fontSize="small" />
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body1" fontWeight={600}>{car.matricula}</Typography>
                            {car.tipo && <Chip label={car.tipo} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />}
                          </Box>
                          {(car.marca || car.modelo || car.version) && (
                            <Typography variant="body2" color="text.secondary">
                              {[car.marca, car.modelo, car.version].filter(Boolean).join(' ')}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* Detail grid — 2 columns on sm+ */}
                      <Box sx={{ pl: 6, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.75 }}>
                        {car.fecha_rego && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <CalendarMonth sx={{ fontSize: 15, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Rego: {formatDate(car.fecha_rego)}
                            </Typography>
                          </Box>
                        )}
                        {(car.proximo_mantenimiento_fecha || car.fecha_mantenimiento) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Build sx={{ fontSize: 15, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Mant: {formatDate(car.proximo_mantenimiento_fecha || car.fecha_mantenimiento)}
                            </Typography>
                          </Box>
                        )}
                        {car.seguro_info && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Security sx={{ fontSize: 15, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              Seguro: {car.seguro_info}
                            </Typography>
                          </Box>
                        )}
                        {car.caracteristicas && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Settings sx={{ fontSize: 15, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {car.caracteristicas}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {car.comentarios && (
                        <Box sx={{ pl: 6, mt: 0.75, display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                          <Notes sx={{ fontSize: 15, color: 'text.secondary', mt: 0.1 }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {car.comentarios}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Portfolio + Tools tabbed section */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, px: 2, py: 1 }}>
          <Tabs
            value={bottomTab}
            onChange={(_e, v) => { setBottomTab(v); setBottomSearch(''); }}
            sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600 } }}
          >
            <Tab
              icon={<LocationOn sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={`Sitios (${portfolio.length})`}
            />
            <Tab
              icon={<Construction sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={`Herramientas (${tools.length})`}
            />
          </Tabs>

          <TextField
            size="small"
            placeholder="Buscar…"
            value={bottomSearch}
            onChange={(e) => setBottomSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />
        </Box>

        <Divider />

        {/* Sites tab */}
        {bottomTab === 0 && (() => {
          const q = bottomSearch.toLowerCase();
          const filtered = q
            ? portfolio.filter((s) =>
                [s.direccion_linea1, s.suburb, s.state, s.cliente_nombre, s.frecuencia]
                  .filter(Boolean).join(' ').toLowerCase().includes(q))
            : portfolio;

          if (filtered.length === 0) {
            return (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {portfolio.length === 0 ? 'Sin sitios asignados' : 'Sin resultados'}
                </Typography>
              </Box>
            );
          }

          return (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Dirección</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Frecuencia</TableCell>
                    <TableCell>Horas/trabajador</TableCell>
                    <TableCell>Bins</TableCell>
                    <TableCell>Fecha asignación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow
                      key={s.site_id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/sitios/${s.site_id}`)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{s.direccion_linea1}</Typography>
                        {(s.suburb || s.state) && (
                          <Typography variant="caption" color="text.secondary">
                            {[s.suburb, s.state, s.postcode].filter(Boolean).join(', ')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {s.cliente_nombre ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Business sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2">{s.cliente_nombre}</Typography>
                          </Box>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        {s.frecuencia ? (
                          <Chip label={s.frecuencia} size="small" variant="outlined" />
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        {s.horas_por_trabajador != null ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Schedule sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2">{s.horas_por_trabajador}h</Typography>
                          </Box>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        {s.hace_bins
                          ? <Chip label={s.pago_bins != null ? `$${s.pago_bins}` : 'Sí'} size="small" color="success" />
                          : '—'}
                      </TableCell>
                      <TableCell>{formatDate(s.fecha_asignacion)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell colSpan={3} sx={{ borderBottom: 0 }}>
                      <Typography variant="body2" fontWeight={700}>Total</Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: 0 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {filtered.reduce((sum, s) => sum + (Number(s.horas_por_trabajador) || 0), 0)}h
                      </Typography>
                    </TableCell>
                    <TableCell colSpan={2} sx={{ borderBottom: 0 }} />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          );
        })()}

        {/* Tools tab */}
        {bottomTab === 1 && (() => {
          const q = bottomSearch.toLowerCase();
          const filtered = q
            ? tools.filter((t) =>
                [t.code, t.nombre, t.descripcion, t.ubicacion]
                  .filter(Boolean).join(' ').toLowerCase().includes(q))
            : tools;

          if (filtered.length === 0) {
            return (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {tools.length === 0 ? 'Sin herramientas asignadas' : 'Sin resultados'}
                </Typography>
              </Box>
            );
          }

          return (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Código</TableCell>
                    <TableCell>Herramienta</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Precio</TableCell>
                    <TableCell>Ubicación</TableCell>
                    <TableCell>Mantenimiento</TableCell>
                    <TableCell>Último mant.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{t.code || '—'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{t.nombre}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.descripcion || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {t.precio_unitario != null
                          ? <Typography variant="body2">${Number(t.precio_unitario).toFixed(2)}</Typography>
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {t.ubicacion
                          ? <Chip label={t.ubicacion} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.75rem' }} />
                          : '—'}
                      </TableCell>
                      <TableCell align="center">
                        {t.requiere_mantenimiento
                          ? <CheckCircle fontSize="small" color="success" />
                          : <Cancel fontSize="small" color="error"  />}
                      </TableCell>
                      <TableCell>
                        {t.requiere_mantenimiento && t.fecha_ultimo_mantenimiento
                          ? formatDate(t.fecha_ultimo_mantenimiento)
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          );
        })()}
      </Paper>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onClose={() => setAddMemberOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar miembro</DialogTitle>
        <DialogContent>
          <Autocomplete
            value={selectedUser}
            onChange={(_, val) => setSelectedUser(val)}
            options={availableUsers}
            getOptionLabel={(u) => `${u.nombre} ${u.apellido} (${u.rol})`}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            renderInput={(params) => <TextField {...params} label="Usuario" sx={{ mt: 1 }} />}
            renderOption={(props, option) => {
              const { key, ...rest } = props;
              return (
                <li key={key} {...rest}>
                  <Box>
                    <Typography variant="body2">{option.nombre} {option.apellido}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.rol} {option.email ? `· ${option.email}` : ''}
                    </Typography>
                  </Box>
                </li>
              );
            }}
            noOptionsText="No hay usuarios disponibles"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAddMember} disabled={!selectedUser || addingSaving}>
            {addingSaving ? 'Agregando…' : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Member Confirm */}
      <ConfirmDialog
        open={!!removeTarget}
        title="Remover miembro"
        message={removeTarget ? `¿Estás seguro de que querés remover a ${removeTarget.nombre} ${removeTarget.apellido} de este equipo?` : ''}
        onConfirm={handleRemoveMember}
        onClose={() => setRemoveTarget(null)}
      />
    </>
  );
}
