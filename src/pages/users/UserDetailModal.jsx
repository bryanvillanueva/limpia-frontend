import {
  Box,
  Typography,
  Chip,
  Grid,
  Divider,
  Button,
  alpha,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  Badge,
  CardTravel,
  Event,
  CheckCircle,
  Cancel,
  Edit,
  Warning,
} from '@mui/icons-material';
import FormModal from '../../components/ui/FormModal';

const ROLE_LABELS = { admin: 'Administrador', manager: 'Manager', accountant: 'Contador', cleaner: 'Limpiador' };
const ROLE_COLORS = { admin: 'error', manager: 'warning', accountant: 'info', cleaner: 'success' };

/**
 * Formatea una fecha ISO a formato legible.
 */
function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
}

/**
 * Determina el estado de la visa basado en su fecha de vencimiento.
 */
function getVisaStatus(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  const diffDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'warning';
  return 'ok';
}

/**
 * Fila de información con icono, etiqueta y valor.
 */
function InfoRow({ icon, label, value, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          color: 'primary.main',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        {children || (
          <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25 }}>
            {value || <Box component="span" sx={{ color: 'text.disabled' }}>No especificado</Box>}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/**
 * Modal para visualizar los detalles completos de un usuario.
 * Muestra toda la información del usuario en un formato de solo lectura.
 */
export default function UserDetailModal({ open, onClose, user, onEdit, canEdit }) {
  if (!user) return null;

  const visaStatus = getVisaStatus(user.fecha_vencimiento_visa);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Detalle del usuario"
      maxWidth="sm"
    >
      {/* ───────────────────── Header con nombre y estado ───────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {user.nombre} {user.apellido}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Chip
              label={ROLE_LABELS[user.rol] || user.rol}
              color={ROLE_COLORS[user.rol] || 'default'}
              size="small"
            />
            <Chip
              icon={user.activo ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
              label={user.activo ? 'Activo' : 'Inactivo'}
              color={user.activo ? 'success' : 'default'}
              size="small"
              variant={user.activo ? 'filled' : 'outlined'}
            />
          </Box>
        </Box>
        {canEdit && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Edit />}
            onClick={() => { onClose(); onEdit(user); }}
          >
            Editar
          </Button>
        )}
      </Box>

      {/* ───────────────────── Información de cuenta ───────────────────── */}
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
        INFORMACIÓN DE CUENTA
      </Typography>
      <Grid container spacing={0}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoRow icon={<Person fontSize="small" />} label="Nombre completo" value={`${user.nombre} ${user.apellido}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoRow icon={<Email fontSize="small" />} label="Correo electrónico" value={user.email} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoRow icon={<Badge fontSize="small" />} label="Rol">
            <Chip
              label={ROLE_LABELS[user.rol] || user.rol}
              color={ROLE_COLORS[user.rol] || 'default'}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </InfoRow>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* ───────────────────── Información de contacto ───────────────────── */}
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
        INFORMACIÓN DE CONTACTO
      </Typography>
      <Grid container spacing={0}>
        <Grid size={12}>
          <InfoRow icon={<Home fontSize="small" />} label="Dirección" value={user.direccion} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoRow icon={<Phone fontSize="small" />} label="Teléfono" value={user.telefono} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* ───────────────────── Información de visa ───────────────────── */}
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
        INFORMACIÓN DE VISA
      </Typography>
      <Grid container spacing={0}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoRow icon={<CardTravel fontSize="small" />} label="Tipo de visa" value={user.tipo_visa} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <InfoRow icon={<Event fontSize="small" />} label="Fecha de vencimiento">
            {user.fecha_vencimiento_visa ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                {visaStatus === 'expired' && <Warning fontSize="small" color="error" />}
                {visaStatus === 'warning' && <Warning fontSize="small" color="warning" />}
                <Typography
                  variant="body2"
                  fontWeight={500}
                  color={
                    visaStatus === 'expired' ? 'error.main' :
                    visaStatus === 'warning' ? 'warning.main' : 'text.primary'
                  }
                >
                  {formatDate(user.fecha_vencimiento_visa)}
                  {visaStatus === 'expired' && ' (Vencida)'}
                  {visaStatus === 'warning' && ' (Próxima a vencer)'}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" fontWeight={500} sx={{ mt: 0.25, color: 'text.disabled' }}>
                No especificado
              </Typography>
            )}
          </InfoRow>
        </Grid>
      </Grid>

      {/* ───────────────────── Botón cerrar ───────────────────── */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
      </Box>
    </FormModal>
  );
}
