import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button,
} from '@mui/material';

export default function ConfirmDialog({ open, title, message, onConfirm, onClose, confirmColor = 'error' }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title || '¿Estás seguro?'}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" color={confirmColor} onClick={() => { onConfirm(); onClose(); }}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
