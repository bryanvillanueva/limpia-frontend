import { Box, Typography, IconButton, alpha } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

/**
 * Header for detail pages: bordered back button, optional icon badge, title with chips,
 * a subtitle line and an optional action on the right. Matches PageHeader's spacing/border.
 *
 * @param {Function}  onBack    - Back button handler.
 * @param {ReactNode} [icon]    - Icon shown in a tinted badge before the title.
 * @param {ReactNode} title     - Main title (wraps on small screens).
 * @param {ReactNode} [chips]   - Badges/chips shown next to the title.
 * @param {ReactNode} [subtitle]- Secondary line under the title.
 * @param {ReactNode} [action]  - Button(s) aligned to the right (full width under the title on phones).
 */
export default function DetailHeader({ onBack, icon, title, chips, subtitle, action }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: 2,
        mb: 3,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <IconButton
        onClick={onBack}
        aria-label="Volver"
        sx={{ border: '1px solid', borderColor: 'divider', width: 40, height: 40, flexShrink: 0 }}
      >
        <ArrowBack fontSize="small" />
      </IconButton>

      {icon && (
        <Box
          sx={{
            width: 44, height: 44, borderRadius: 2.5, flexShrink: 0,
            display: { xs: 'none', sm: 'flex' }, alignItems: 'center', justifyContent: 'center',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
            color: 'primary.main',
          }}
        >
          {icon}
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.25rem', sm: '1.625rem' }, wordBreak: 'break-word' }}>
            {title}
          </Typography>
          {chips}
        </Box>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {action && (
        <Box sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>{action}</Box>
      )}
    </Box>
  );
}
