import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box, Paper, Grid, TextField, Button, Alert, Avatar, Typography, Skeleton, Snackbar,
  IconButton, InputAdornment, LinearProgress, alpha,
} from '@mui/material';
import { Person, Lock, Visibility, VisibilityOff, Save, Undo } from '@mui/icons-material';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import StatusBadge from '../../components/ui/StatusBadge';
import DateField from '../../components/ui/DateField';
import { useAuth } from '../../context/AuthContext';
import { getMyProfile, updateMyProfile, changePassword } from '../../services/auth.service';

const ROLE_LABELS = { admin: 'Administrador', manager: 'Manager', accountant: 'Contador', cleaner: 'Limpiador' };
const ROLE_TONES = { admin: 'error', manager: 'warning', accountant: 'info', cleaner: 'success' };

const EDITABLE = ['nombre', 'apellido', 'telefono', 'direccion', 'tipo_visa', 'fecha_vencimiento_visa'];

const toForm = (p) => Object.fromEntries(EDITABLE.map((k) => [k, p?.[k] ?? '']));

/** 0-4 score: length, mixed case, digits, symbols. Only a visual hint, the server enforces the real rules. */
function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1;
  return score;
}
const STRENGTH = [
  { label: 'Muy débil', color: 'error' },
  { label: 'Débil', color: 'error' },
  { label: 'Aceptable', color: 'warning' },
  { label: 'Buena', color: 'success' },
  { label: 'Muy buena', color: 'success' },
];

/**
 * Self-service profile: basic data and password change.
 * Email and role are shown but not editable (the email is the login; an admin manages both).
 */
export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(toForm(null));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [notice, setNotice] = useState('');

  // Password card
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const p = await getMyProfile();
      setProfile(p);
      setForm(toForm(p));
    } catch {
      setLoadError('No se pudo cargar tu perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const dirty = useMemo(
    () => !!profile && EDITABLE.some((k) => (form[k] ?? '') !== (profile[k] ?? '')),
    [form, profile],
  );

  const setField = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setSaveError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setSaveError('El nombre es obligatorio'); return; }
    setSaving(true);
    setSaveError('');
    try {
      const updated = await updateMyProfile(form);
      setProfile(updated);
      setForm(toForm(updated));
      updateUser({ nombre: updated.nombre }); // refresh the name shown in the top bar
      setNotice('Datos actualizados');
    } catch (err) {
      setSaveError(err.response?.data?.message || 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  // ---- password
  const strength = passwordStrength(pw.next);
  const mismatch = !!pw.confirm && pw.next !== pw.confirm;
  const tooShort = !!pw.next && pw.next.length < 8;
  const canChange = !!pw.current && pw.next.length >= 8 && pw.next === pw.confirm && pw.next !== pw.current && !pwSaving;

  const setPwField = (k) => (e) => { setPw((p) => ({ ...p, [k]: e.target.value })); setPwError(''); };
  const toggle = (k) => () => setShow((s) => ({ ...s, [k]: !s[k] }));

  const eye = (k) => ({
    input: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton size="small" onClick={toggle(k)} edge="end" aria-label={show[k] ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            {show[k] ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
        </InputAdornment>
      ),
    },
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!canChange) return;
    setPwSaving(true);
    setPwError('');
    try {
      await changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      setShow({ current: false, next: false, confirm: false });
      setNotice('Contraseña actualizada');
    } catch (err) {
      setPwError(err.response?.data?.message || 'No se pudo cambiar la contraseña');
    } finally {
      setPwSaving(false);
    }
  };

  const fullName = [profile?.nombre, profile?.apellido].filter(Boolean).join(' ') || user?.nombre || '';
  const initials = fullName.split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <>
      <PageHeader title="Mi perfil" subtitle="Actualiza tus datos y tu contraseña" />

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={load}>Reintentar</Button>}>
          {loadError}
        </Alert>
      )}

      {/* Identity */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2.5, mb: 3,
          display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap',
        }}
      >
        {loading ? (
          <>
            <Skeleton variant="circular" width={64} height={64} />
            <Box><Skeleton width={180} height={28} /><Skeleton width={220} height={18} /></Box>
          </>
        ) : (
          <>
            <Avatar sx={{ width: 64, height: 64, fontSize: '1.5rem', fontWeight: 700, bgcolor: 'primary.main' }}>{initials}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>{fullName}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.25 }}>
                {profile && <StatusBadge tone={ROLE_TONES[profile.rol] || 'primary'} label={ROLE_LABELS[profile.rol] || profile.rol} />}
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>{profile?.email}</Typography>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Basic data */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%', overflow: 'hidden' }}>
            <SectionHeader icon={<Person />} title="Mis datos" />
            <Box component="form" onSubmit={handleSave} noValidate sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {saveError && <Alert severity="error" onClose={() => setSaveError('')}>{saveError}</Alert>}

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Nombre" value={form.nombre} onChange={setField('nombre')} required fullWidth disabled={loading}
                    slotProps={{ htmlInput: { maxLength: 100, autoComplete: 'given-name' } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Apellido" value={form.apellido} onChange={setField('apellido')} fullWidth disabled={loading}
                    slotProps={{ htmlInput: { maxLength: 100, autoComplete: 'family-name' } }} />
                </Grid>
                <Grid size={12}>
                  <TextField label="Email" value={profile?.email ?? ''} fullWidth disabled
                    helperText="Es tu usuario para iniciar sesión. Para cambiarlo, contacta a un administrador." />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Teléfono" value={form.telefono} onChange={setField('telefono')} fullWidth disabled={loading}
                    slotProps={{ htmlInput: { maxLength: 20, inputMode: 'tel', autoComplete: 'tel' } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Tipo de visa" value={form.tipo_visa} onChange={setField('tipo_visa')} fullWidth disabled={loading}
                    slotProps={{ htmlInput: { maxLength: 50 } }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <DateField label="Vencimiento de la visa" value={form.fecha_vencimiento_visa} onChange={setField('fecha_vencimiento_visa')} disabled={loading} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: { xs: 'none', sm: 'block' } }} />
                <Grid size={12}>
                  <TextField label="Dirección" value={form.direccion} onChange={setField('direccion')} fullWidth multiline minRows={2} disabled={loading}
                    slotProps={{ htmlInput: { maxLength: 255, autoComplete: 'street-address' } }} />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Button startIcon={<Undo />} onClick={() => { setForm(toForm(profile)); setSaveError(''); }} disabled={!dirty || saving}>
                  Descartar cambios
                </Button>
                <Button type="submit" variant="contained" startIcon={<Save />} disabled={!dirty || saving || loading}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Password */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%', overflow: 'hidden' }}>
            <SectionHeader icon={<Lock />} title="Cambiar contraseña" />
            <Box component="form" onSubmit={handleChangePassword} noValidate sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pwError && <Alert severity="error" onClose={() => setPwError('')}>{pwError}</Alert>}

              <TextField
                label="Contraseña actual" type={show.current ? 'text' : 'password'} value={pw.current} onChange={setPwField('current')}
                fullWidth required slotProps={{ ...eye('current'), htmlInput: { autoComplete: 'current-password' } }}
              />
              <TextField
                label="Nueva contraseña" type={show.next ? 'text' : 'password'} value={pw.next} onChange={setPwField('next')}
                fullWidth required error={tooShort}
                helperText={tooShort ? 'Debe tener al menos 8 caracteres' : 'Mínimo 8 caracteres. Mezcla mayúsculas, números y símbolos.'}
                slotProps={{ ...eye('next'), htmlInput: { autoComplete: 'new-password', maxLength: 72 } }}
              />
              {!!pw.next && (
                <Box>
                  <LinearProgress
                    variant="determinate" value={(strength / 4) * 100} color={STRENGTH[strength].color}
                    sx={{ height: 6, borderRadius: 3, bgcolor: (t) => alpha(t.palette.text.primary, 0.08) }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'none', letterSpacing: 0 }}>
                    Seguridad: {STRENGTH[strength].label}
                  </Typography>
                </Box>
              )}
              <TextField
                label="Confirmar nueva contraseña" type={show.confirm ? 'text' : 'password'} value={pw.confirm} onChange={setPwField('confirm')}
                fullWidth required error={mismatch} helperText={mismatch ? 'Las contraseñas no coinciden' : ' '}
                slotProps={{ ...eye('confirm'), htmlInput: { autoComplete: 'new-password', maxLength: 72 } }}
              />
              {!!pw.next && pw.next === pw.current && (
                <Typography variant="caption" color="error" sx={{ textTransform: 'none', letterSpacing: 0, mt: -1 }}>
                  La nueva contraseña debe ser distinta de la actual
                </Typography>
              )}

              <Button type="submit" variant="contained" disabled={!canChange} startIcon={<Lock />} sx={{ alignSelf: 'flex-end' }}>
                {pwSaving ? 'Cambiando...' : 'Cambiar contraseña'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={!!notice}
        autoHideDuration={5000}
        onClose={(_, reason) => { if (reason !== 'clickaway') setNotice(''); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setNotice('')} sx={{ width: '100%' }}>{notice}</Alert>
      </Snackbar>
    </>
  );
}
