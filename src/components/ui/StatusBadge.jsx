import { Chip } from '@mui/material';

const STATUS_MAP = {
  activo:       { label: 'Activo',       bg: '#e8f5e9', fg: '#2e7d32' },
  inactivo:     { label: 'Inactivo',     bg: '#f5f5f5', fg: '#9e9e9e' },
  pendiente:    { label: 'Pendiente',    bg: '#fff8e1', fg: '#f57f17' },
  aprobado:     { label: 'Aprobado',     bg: '#e8f5e9', fg: '#2e7d32' },
  rechazado:    { label: 'Rechazado',    bg: '#ffebee', fg: '#c62828' },
  completado:   { label: 'Completado',   bg: '#e3f2fd', fg: '#1565c0' },
  abierto:      { label: 'Abierto',      bg: '#ffebee', fg: '#c62828' },
  en_proceso:   { label: 'En proceso',   bg: '#fff8e1', fg: '#f57f17' },
  cerrado:      { label: 'Cerrado',      bg: '#f5f5f5', fg: '#757575' },
  disponible:   { label: 'Disponible',   bg: '#e8f5e9', fg: '#2e7d32' },
  en_uso:       { label: 'En uso',       bg: '#fff8e1', fg: '#f57f17' },
  mantenimiento:{ label: 'Mantenimiento',bg: '#ffebee', fg: '#c62828' },
  oficina:      { label: 'Oficina',      bg: '#e3f2fd', fg: '#1565c0' },
  asignada:     { label: 'Asignada',     bg: '#f3e5f5', fg: '#7b1fa2' },
};

export default function StatusBadge({ value, size = 'small' }) {
  const cfg = STATUS_MAP[value] || { label: value, bg: '#f5f5f5', fg: '#616161' };
  return (
    <Chip
      label={cfg.label}
      size={size}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.fg,
        fontWeight: 600,
        border: 'none',
      }}
    />
  );
}
