import { Dialog, DialogTitle, DialogContent, IconButton, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';

export default function FormModal({ open, onClose, title, children, maxWidth = 'sm' }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth>
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
