import { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Alert, CircularProgress,
  useMediaQuery, useTheme, alpha,
} from '@mui/material';
import { CleaningServices, DeleteOutline, Tune, CheckCircle } from '@mui/icons-material';
import StatusBadge from '../ui/StatusBadge';
import { getSharePreview, acceptLogShare, rejectLogShare } from '../../services/logShares.service';

const ENTRY_META = {
  SERVICE: { label: 'Service', tone: 'success', icon: <CleaningServices fontSize="small" /> },
  BINS: { label: 'Bins', tone: 'info', icon: <DeleteOutline fontSize="small" /> },
  CUSTOM: { label: 'Otro', tone: 'warning', icon: <Tune fontSize="small" /> },
};

const hours = (n) => (n === null || n === undefined ? '—' : `${Number(n).toFixed(2).replace(/\.?0+$/, '') || '0'} h`);

const fmtRange = (a, b) => {
  const f = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }); };
  return `${f(a)} – ${f(b)}`;
};

const dayHeading = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/**
 * Lets the recipient review a log-share request BEFORE deciding: every offered log, whether it would be created
 * or skipped because they already have it (showing their own log), and the totals.
 * Accepting shows a confirmation and then reloads the page so the new logs appear everywhere.
 *
 * @param {boolean}  open
 * @param {number}   shareId
 * @param {Function} onClose        - Close without answering.
 * @param {Function} onRejected     - Called after the request was rejected.
 * @param {Function} [onReload]     - How to refresh the page after accepting (default: window.location.reload).
 */
export default function ShareReviewDialog({ open, shareId, onClose, onRejected, onReload = () => window.location.reload() }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(null); // 'accept' | 'reject'
  const [result, setResult] = useState(null); // accept summary

  useEffect(() => {
    if (!open || !shareId) return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    setPreview(null);
    setResult(null);
    getSharePreview(shareId)
      .then((p) => { if (!cancelled) setPreview(p); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.message || 'No se pudo cargar la solicitud'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, shareId]);

  // After accepting: show the confirmation for a moment, then refresh the page
  useEffect(() => {
    if (!result) return undefined;
    const timer = setTimeout(() => onReload(), 1600);
    return () => clearTimeout(timer);
  }, [result, onReload]);

  const groups = useMemo(() => {
    const map = new Map();
    (preview?.items || []).forEach((it) => {
      if (!map.has(it.fecha)) map.set(it.fecha, []);
      map.get(it.fecha).push(it);
    });
    return [...map.entries()];
  }, [preview]);

  const pending = preview?.status === 'pending';
  const createCount = preview?.summary?.create_count ?? 0;
  const skipCount = preview?.summary?.skip_count ?? 0;
  const senderName = preview ? `${preview.sender.nombre} ${preview.sender.apellido || ''}`.trim() : '';

  const accept = async () => {
    setBusy('accept');
    setError('');
    try {
      const res = await acceptLogShare(shareId);
      setResult(res.summary || { created: 0, skipped_existing: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo aceptar la solicitud');
    } finally {
      setBusy(null);
    }
  };

  const reject = async () => {
    setBusy('reject');
    setError('');
    try {
      await rejectLogShare(shareId);
      onRejected?.();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo rechazar la solicitud');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Dialog open={open} onClose={() => { if (!busy && !result) onClose(); }} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      {result ? (
        /* ---- confirmation (the page reloads right after) ---- */
        <DialogContent sx={{ py: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <CheckCircle color="success" sx={{ fontSize: 64 }} />
          <Typography variant="h6" fontWeight={800}>
            {result.created > 0
              ? `Se sincronizaron ${result.created} log${result.created !== 1 ? 's' : ''}`
              : 'No había nada nuevo que sincronizar'}
          </Typography>
          {result.skipped_existing > 0 && (
            <Typography variant="body2" color="text.secondary">
              {result.skipped_existing} ya {result.skipped_existing !== 1 ? 'los' : 'lo'} tenías y no se tocaron
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mt: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2">Actualizando la página…</Typography>
          </Box>
        </DialogContent>
      ) : (
        <>
          <DialogTitle sx={{ pb: 1 }}>
            {preview ? `${senderName} te comparte ${preview.summary.total} log${preview.summary.total !== 1 ? 's' : ''}` : 'Solicitud de logs'}
            {preview && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                Semana del {fmtRange(preview.fecha_inicio, preview.fecha_fin)}
              </Typography>
            )}
          </DialogTitle>

          <DialogContent dividers sx={{ px: { xs: 2, sm: 3 } }}>
            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={28} /></Box>}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {preview && !pending && (
              <Alert severity="info">Esta solicitud ya fue respondida.</Alert>
            )}

            {preview && pending && (
              <>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                  <StatusBadge tone="success" label={`Se crearán ${createCount}`} />
                  {skipCount > 0 && <StatusBadge tone="neutral" label={`Ya los tienes ${skipCount}`} />}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Solo se crean los que te faltan. Tus logs nunca se reemplazan: si ya tienes uno del mismo sitio, día y tipo, se conserva el tuyo.
                </Typography>

                {groups.map(([fecha, items]) => (
                  <Box key={fecha} sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>{dayHeading(fecha)}</Typography>
                    {items.map((it, i) => {
                      const meta = ENTRY_META[it.entry_type || 'SERVICE'] || ENTRY_META.SERVICE;
                      const skip = it.action === 'skip';
                      return (
                        <Box
                          key={`${fecha}-${i}`}
                          sx={{
                            display: 'flex', gap: 1.5, py: 1, px: 1.25, mb: 0.75, borderRadius: 2,
                            border: '1px solid', borderColor: 'divider',
                            opacity: skip ? 0.75 : 1,
                            bgcolor: (t) => (skip ? alpha(t.palette.text.primary, 0.03) : alpha(t.palette.success.main, 0.04)),
                          }}
                        >
                          <Box
                            sx={{
                              width: 32, height: 32, borderRadius: 1.5, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              bgcolor: (t) => alpha(t.palette[meta.tone].main, 0.12), color: `${meta.tone}.main`,
                            }}
                          >
                            {meta.icon}
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                              <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
                                {it.sitio}{it.suburb ? `, ${it.suburb}` : ''}
                              </Typography>
                              <Typography variant="body2" fontWeight={700} color={`${meta.tone}.main`} sx={{ flexShrink: 0 }}>
                                {hours(it.display_value)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mt: 0.25 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'none', letterSpacing: 0 }}>{meta.label}</Typography>
                              <StatusBadge tone={skip ? 'neutral' : 'success'} label={skip ? 'Ya lo tienes' : 'Nuevo'} />
                            </Box>
                            {it.observaciones && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textTransform: 'none', letterSpacing: 0 }}>
                                «{it.observaciones}»
                              </Typography>
                            )}
                            {skip && it.existing && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textTransform: 'none', letterSpacing: 0 }}>
                                Tu log: {hours(it.existing.display_value)}{it.existing.observaciones ? ` · «${it.existing.observaciones}»` : ''}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ))}

                {createCount === 0 && (
                  <Alert severity="info" sx={{ mt: 1 }}>Ya tienes todos estos logs, no hay nada nuevo que recibir.</Alert>
                )}
              </>
            )}
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
            <Button onClick={onClose} disabled={!!busy} sx={{ mr: 'auto' }}>Cerrar</Button>
            {pending && (
              <>
                <Button variant="outlined" color="error" onClick={reject} disabled={!!busy || loading}>
                  {busy === 'reject' ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : 'Rechazar'}
                </Button>
                <Button variant="contained" onClick={accept} disabled={!!busy || loading || !preview}>
                  {busy === 'accept'
                    ? <CircularProgress size={18} sx={{ color: 'inherit' }} />
                    : createCount > 0 ? `Aceptar ${createCount} log${createCount !== 1 ? 's' : ''}` : 'Aceptar'}
                </Button>
              </>
            )}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
