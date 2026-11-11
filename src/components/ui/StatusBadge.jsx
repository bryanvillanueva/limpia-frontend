import { Chip, alpha } from '@mui/material';

// tone: palette key, 'neutral' (grey) or a custom hex color
const STATUS_MAP = {
  activo:        { label: 'Activo',        tone: 'success' },
  inactivo:      { label: 'Inactivo',      tone: 'neutral' },
  pendiente:     { label: 'Pendiente',     tone: 'warning' },
  aprobado:      { label: 'Aprobado',      tone: 'success' },
  rechazado:     { label: 'Rechazado',     tone: 'error' },
  completado:    { label: 'Completado',    tone: 'info' },
  abierto:       { label: 'Abierto',       tone: 'error' },
  en_proceso:    { label: 'En proceso',    tone: 'warning' },
  cerrado:       { label: 'Cerrado',       tone: 'neutral' },
  disponible:    { label: 'Disponible',    tone: 'success' },
  en_uso:        { label: 'En uso',        tone: 'warning' },
  mantenimiento: { label: 'Mantenimiento', tone: 'error' },
  oficina:       { label: 'Oficina',       tone: 'info' },
  asignada:      { label: 'Asignada',      tone: '#7b1fa2' },
};

/**
 * Status chip. Colors come from the theme (tinted background + readable text),
 * so it looks right in both light and dark mode.
 */
export default function StatusBadge({ value, size = 'small' }) {
  const cfg = STATUS_MAP[value] || { label: value, tone: 'neutral' };

  return (
    <Chip
      label={cfg.label}
      size={size}
      sx={(theme) => {
        const dark = theme.palette.mode === 'dark';
        let base;
        let text;
        if (cfg.tone === 'neutral') {
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
