import { Typography } from '@mui/material';

/** Small uppercase heading used to label a group of cards or a section of a page. */
export default function SectionTitle({ children, sx }) {
  return (
    <Typography
      variant="subtitle2"
      color="text.secondary"
      sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.75rem', ...sx }}
    >
      {children}
    </Typography>
  );
}
