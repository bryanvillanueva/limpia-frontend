import { Box, Typography, alpha } from '@mui/material';

/**
 * Title strip for a card section: tinted icon badge, title and an optional action on the right.
 * Put it at the top of a bordered Paper, above the section content.
 */
export default function SectionHeader({ icon, title, action }) {
  return (
    <Box
      sx={{
        px: 2, py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        minHeight: 56,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 32, height: 32, borderRadius: 2, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
            color: 'primary.main',
            '& .MuiSvgIcon-root': { fontSize: 18 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1, minWidth: 0 }}>
        {title}
      </Typography>
      {action}
    </Box>
  );
}
