import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box,
  ToggleButton, ToggleButtonGroup, RadioGroup, FormControlLabel, Radio, Alert, CircularProgress,
} from '@mui/material';
import { getShareRecipients, createLogShare } from '../../services/logShares.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Dialog to offer the logs of the displayed week to another cleaner.
 * The recipient gets a notification and decides whether to accept; nothing is copied until then.
 *
 * @param {boolean}  open        - Dialog visibility.
 * @param {Function} onClose     - Close handler.
 * @param {string}   fechaInicio - Range start (YYYY-MM-DD).
 * @param {string}   fechaFin    - Range end (YYYY-MM-DD).
 * @param {string}   weekLabel   - Human readable range, e.g. "9 nov — 15 nov".
 * @param {number}   logCount    - Logs the user has in that range.
 * @param {Function} onSent      - Called with a success message after the request is sent.
 */
export default function ShareLogsDialog({ open, onClose, fechaInicio, fechaFin, weekLabel, logCount, onSent }) {
  const [teammates, setTeammates] = useState([]);
  const [loadingMates, setLoadingMates] = useState(false);
  const [mode, setMode] = useState('team'); // 'team' | 'other'
  const [teammateId, setTeammateId] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setError('');
    setEmail('');
    setLoadingMates(true);
    getShareRecipients()
      .then(list => {
        if (cancelled) return;
        setTeammates(list);
        setMode(list.length > 0 ? 'team' : 'other');
        setTeammateId(list.length === 1 ? String(list[0].id) : '');
      })
      .catch(() => {
        if (cancelled) return;
        setTeammates([]);
        setMode('other');
      })
      .finally(() => { if (!cancelled) setLoadingMates(false); });
    return () => { cancelled = true; };
  }, [open]);

  const hasTeam = teammates.length > 0;
  const canSend = !sending && (mode === 'team' ? !!teammateId : EMAIL_RE.test(email.trim()));

  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      const payload = { fecha_inicio: fechaInicio, fecha_fin: fechaFin };
      if (mode === 'team') payload.recipient_id = Number(teammateId);
      else payload.recipient_email = email.trim();

      const result = await createLogShare(payload);
      const name = `${result.recipient.nombre} ${result.recipient.apellido || ''}`.trim();
      onSent?.(`Solicitud enviada a ${name}. Le llegará una notificación para aceptarla.`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo enviar la solicitud');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !sending && onClose()} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Compartir logs</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
        <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">Semana a compartir</Typography>
          <Typography variant="body2" fontWeight={600}>
            {weekLabel} · {logCount} log{logCount !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

        {loadingMates ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={24} /></Box>
        ) : (
          <>
            {hasTeam && (
              <ToggleButtonGroup
                exclusive
                fullWidth
                size="small"
                value={mode}
                onChange={(_, val) => { if (val) { setMode(val); setError(''); } }}
              >
                <ToggleButton value="team" sx={{ textTransform: 'none', fontWeight: 600 }}>Mi equipo</ToggleButton>
                <ToggleButton value="other" sx={{ textTransform: 'none', fontWeight: 600 }}>Otra persona</ToggleButton>
              </ToggleButtonGroup>
            )}

            {mode === 'team' ? (
              <RadioGroup value={teammateId} onChange={(e) => setTeammateId(e.target.value)}>
                {teammates.map(t => (
                  <FormControlLabel
                    key={t.id}
                    value={String(t.id)}
                    control={<Radio />}
                    label={`${t.nombre} ${t.apellido || ''}`.trim()}
                  />
                ))}
              </RadioGroup>
            ) : (
              <Box>
                <TextField
                  label="Email de la persona"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  autoComplete="off"
                  slotProps={{ htmlInput: { inputMode: 'email', autoCapitalize: 'none' } }}
                  helperText="Para alguien de otro equipo o sin equipo. Debe tener cuenta en la app."
                />
              </Box>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'none', letterSpacing: 0 }}>
              La persona recibirá una notificación y decide si acepta. Solo se copian los logs que le falten.
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={sending}>Cancelar</Button>
        <Button variant="contained" onClick={handleSend} disabled={!canSend}>
          {sending ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : 'Enviar solicitud'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
