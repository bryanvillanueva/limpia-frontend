import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, Box, alpha,
} from '@mui/material';
import { WarningAmber } from '@mui/icons-material';

export default function ConfirmDialog({ open, title, message, onConfirm, onClose, confirmColor = 'error' }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: 2, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: (t) => alpha(t.palette[confirmColor]?.main || t.palette.error.main, 0.12),
            color: `${confirmColor}.main`,
          }}
        >
          <WarningAmber />
        </Box>
        {title || '¿Estás seguro?'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color={confirmColor} onClick={() => { onConfirm(); onClose(); }}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
