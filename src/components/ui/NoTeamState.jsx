import { Box, Typography, Paper, alpha } from '@mui/material';
import { Groups } from '@mui/icons-material';

/**
 * Friendly state for a cleaner who is not in a team yet. It explains what is going on and what to do,
 * instead of showing a red error.
 */
export default function NoTeamState({
  title = 'Todavía no tienes un equipo asignado',
  message = 'Para registrar logs, ver el planner o hacer pedidos necesitas estar en un equipo. Pídele a un administrador que te asigne a uno y esta pantalla se activará.',
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid', borderColor: 'divider', borderRadius: 3,
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        gap: 1.5, px: 3, py: 7,
      }}
    >
      <Box
        sx={{
          width: 72, height: 72, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
          color: 'primary.main',
          '& .MuiSvgIcon-root': { fontSize: 36 },
        }}
      >
        <Groups />
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440 }}>{message}</Typography>
    </Paper>
  );
}
