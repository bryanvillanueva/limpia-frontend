import { Box, Typography } from '@mui/material';
import { InboxOutlined } from '@mui/icons-material';

export default function EmptyState({ message = 'No hay datos', icon }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1.5 }}>
      {icon || <InboxOutlined sx={{ fontSize: 44, color: 'text.disabled', opacity: 0.5 }} />}
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
    </Box>
  );
}
