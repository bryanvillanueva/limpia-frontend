import { Chip, alpha } from '@mui/material';

// tone: palette key ('success', 'warning', ...), 'neutral' (grey) or a custom hex color
const STATUS_MAP = {
  activo:        { label: 'Activo',        tone: 'success' },
  inactivo:      { label: 'Inactivo',      tone: 'neutral' },
  pendiente:     { label: 'Pendiente',     tone: 'warning' },
  aprobado:      { label: 'Aprobado',      tone: 'success' },
  rechazado:     { label: 'Rechazado',     tone: 'error' },
  resuelto:      { label: 'Resuelto',      tone: 'success' },
  confirmado:    { label: 'Confirmado',    tone: 'success' },
  completado:    { label: 'Completado',    tone: 'info' },
  abierto:       { label: 'Abierto',       tone: 'error' },
  en_proceso:    { label: 'En proceso',    tone: 'warning' },
  cerrado:       { label: 'Cerrado',       tone: 'neutral' },
  disponible:    { label: 'Disponible',    tone: 'success' },
  en_uso:        { label: 'En uso',        tone: 'warning' },
  mantenimiento: { label: 'Mantenimiento', tone: 'error' },
  oficina:       { label: 'Oficina',       tone: 'info' },
  asignada:      { label: 'Asignada',      tone: '#7b1fa2' },
  // Reports
  borrador:      { label: 'Borrador',      tone: 'neutral' },
  enviado:       { label: 'Enviado',       tone: 'warning' },
  pagado:        { label: 'Pagado',        tone: 'success' },
  devuelto:      { label: 'Devuelto',      tone: 'error' },
  eliminado:     { label: 'Eliminado',     tone: 'neutral' },
};

/**
 * Status/role chip. Colors come from the theme (tinted background + readable text),
 * so it looks right in both light and dark mode.
 *
 * @param {string} [value] - Known status key (case-insensitive), e.g. 'activo', 'Enviado'.
 * @param {string} [label] - Overrides the displayed text.
 * @param {string} [tone]  - Use a tone directly instead of a status key (e.g. for roles).
 */
export default function StatusBadge({ value, label, tone, size = 'small' }) {
  const known = STATUS_MAP[value] || STATUS_MAP[String(value ?? '').toLowerCase()];
  const cfg = tone
    ? { label: label ?? value, tone }
    : { label: label ?? known?.label ?? value, tone: known?.tone ?? 'neutral' };

  return (
    <Chip
      label={cfg.label}
      size={size}
      sx={(theme) => {
        const dark = theme.palette.mode === 'dark';
        let base;
        let text;
        if (cfg.tone === 'neutral' || !theme.palette[cfg.tone] && !cfg.tone.startsWith('#')) {
          base = theme.palette.text.secondary;
          text = theme.palette.text.secondary;
        } else if (cfg.tone.startsWith('#')) {
          base = cfg.tone;
          text = cfg.tone;
        } else {
          base = theme.palette[cfg.tone].main;
          text = dark ? theme.palette[cfg.tone].light : theme.palette[cfg.tone].dark;
        }
        return {
          bgcolor: alpha(base, dark ? 0.2 : 0.12),
          color: text,
          fontWeight: 600,
          border: 'none',
        };
      }}
    />
  );
}
