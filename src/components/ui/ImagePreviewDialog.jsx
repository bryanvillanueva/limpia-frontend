import { Dialog, DialogTitle, DialogContent, Typography, IconButton, Box } from '@mui/material';
import { Close } from '@mui/icons-material';

/**
 * Lightweight lightbox dialog for previewing an image at full resolution.
 * Reusable across any page that shows clickable thumbnails.
 *
 * @param {string|null} src   - Image URL to display; null hides the dialog.
 * @param {Function}    onClose - Close handler.
 */
export default function ImagePreviewDialog({ src, onClose }) {
  return (
    <Dialog open={!!src} onClose={onClose} maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6" component="span">Vista previa</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        {src && (
          <Box
            component="img"
            src={src}
            alt="Vista previa"
            sx={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: 2 }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
