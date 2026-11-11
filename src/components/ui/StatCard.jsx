import { Box, Typography, Paper, ButtonBase, alpha } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';

const TONES = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];

/**
 * Accepts the new `tone` ('primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary')
 * and the legacy `color` strings used by older pages ('success.main', 'text.disabled', ...).
 */
function resolveTone(tone, color) {
  if (tone && TONES.includes(tone)) return tone;
  if (color) {
    const key = String(color).split('.')[0];
    if (TONES.includes(key)) return key;
    return 'secondary'; // text.disabled / text.secondary -> neutral
  }
  return 'primary';
}

/**
 * Summary card: tinted icon, big number and a label that wraps (never truncated).
 *
 * @param {ReactNode} icon       - Icon element.
 * @param {string}    label      - Description under the number.
 * @param {ReactNode} value      - Number or short text.
 * @param {string}    [subtitle] - Optional small line under the label.
 * @param {string}    [tone]     - Palette color key for the icon and highlight.
 * @param {boolean}   [highlight]- Tint the whole card with its tone (for things that need attention).
 * @param {Function}  [onClick]  - Makes the card a real button (keyboard + focus), with a chevron.
 */
export default function StatCard({ icon, label, value, subtitle, tone, color, highlight = false, onClick }) {
  const toneKey = resolveTone(tone, color);

  const content = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', p: 2 }}>
      <Box
        sx={{
          width: 48, height: 48, borderRadius: 2.5, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: (t) => alpha(t.palette[toneKey].main, 0.12),
          color: `${toneKey}.main`,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3, mt: 0.25 }}>
          {label}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textTransform: 'none', letterSpacing: 0 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {onClick && <ChevronRight fontSize="small" sx={{ color: 'text.disabled', flexShrink: 0 }} />}
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: (t) => (highlight ? alpha(t.palette[toneKey].main, 0.4) : t.palette.divider),
        bgcolor: (t) => (highlight ? alpha(t.palette[toneKey].main, 0.05) : t.palette.background.paper),
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease',
        ...(onClick && {
          '&:hover': {
            borderColor: `${toneKey}.main`,
            boxShadow: (t) => `0 4px 14px ${alpha(t.palette[toneKey].main, 0.14)}`,
            transform: 'translateY(-1px)',
          },
        }),
      }}
    >
      {onClick ? (
        <ButtonBase onClick={onClick} sx={{ display: 'flex', width: '100%', height: '100%', justifyContent: 'flex-start' }}>
          {content}
        </ButtonBase>
      ) : content}
    </Paper>
  );
}
