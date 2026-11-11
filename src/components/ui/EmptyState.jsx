import { Box, Typography, alpha } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

/** Placeholder for empty lists: icon in a soft circle plus a short message. */
export default function EmptyState({ message = 'No hay datos', icon }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 7, px: 2, gap: 1.5, textAlign: 'center' }}>
      <Box
        sx={{
          width: 64, height: 64, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
          color: 'primary.main',
          '& .MuiSvgIcon-root': { fontSize: 32 },
        }}
      >
        {icon || <InboxOutlined />}
      </Box>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
    </Box>
  );
}
