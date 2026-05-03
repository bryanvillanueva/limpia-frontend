import { Dialog, DialogTitle, DialogContent, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';

export default function FormModal({ open, onClose, title, children, maxWidth = 'sm' }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth fullScreen={fullScreen}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" component="span">{title}</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: 'divider' }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}
