import { useState, useEffect, useRef } from 'react';
import {
  DialogActions, Button, TextField, Grid, Alert,
  InputAdornment, Box, Typography, IconButton, CircularProgress,
} from '@mui/material';
import { CloudUpload, Delete } from '@mui/icons-material';
import FormModal from '../../components/ui/FormModal';
import { createSupply, updateSupply, uploadSupplyImage } from '../../services/supplies.service';

const EMPTY = {
  nombre: '',
  descripcion: '',
  unidad: '',
  stock_actual: 0,
  stock_minimo: '',
  precio_unitario: '',
  imagen_url: '',
};

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Create / Edit form for a supply.
 * Includes Cloudinary image upload with local preview, drag-and-drop support,
 * and progress feedback.
 *
 * @param {boolean}  open    - Controls dialog visibility.
 * @param {Function} onClose - Callback to close the dialog.
 * @param {Object|null} supply - Existing supply for editing, or null for create.
 * @param {Function} onSaved - Callback fired after a successful save.
 */
export default function SupplyFormModal({ open, onClose, supply, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(supply
        ? {
          nombre: supply.nombre ?? '',
          descripcion: supply.descripcion ?? '',
          unidad: supply.unidad ?? '',
          stock_actual: supply.stock_actual ?? 0,
          stock_minimo: supply.stock_minimo ?? '',
          precio_unitario: supply.precio_unitario ?? '',
          imagen_url: supply.imagen_url ?? '',
        }
        : EMPTY
      );
      setImageFile(null);
      setImagePreview(supply?.imagen_url || '');
      setError('');
    }
  }, [open, supply]);

  // Clean up blob URLs when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  /**
   * Validates and processes a selected image file.
   * Creates a local blob preview without uploading yet.
   */
  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen (JPG, PNG, WebP o GIF)');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('La imagen no debe superar los 5 MB');
      return;
    }

    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setForm(f => ({ ...f, imagen_url: '' }));
  };

  /**
   * Builds the payload, converting empty optional strings to null.
   */
  const buildPayload = (imageUrl) => ({
    nombre: form.nombre,
    descripcion: form.descripcion || null,
    unidad: form.unidad || null,
    stock_actual: Number(form.stock_actual) || 0,
    stock_minimo: form.stock_minimo !== '' ? Number(form.stock_minimo) : null,
    precio_unitario: form.precio_unitario !== '' ? Number(form.precio_unitario) : null,
    imagen_url: imageUrl || null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let finalImageUrl = form.imagen_url || null;

      if (imageFile) {
        setUploading(true);
        const { imagen_url } = await uploadSupplyImage(imageFile);
        finalImageUrl = imagen_url;
        setUploading(false);
      }

      const payload = buildPayload(finalImageUrl);
      if (supply) await updateSupply(supply.id, payload);
      else await createSupply(payload);

      onSaved();
      onClose();
    } catch (err) {
      setUploading(false);
      setError(err.response?.data?.message || err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const isBusy = saving || uploading;

  return (
    <FormModal open={open} onClose={onClose} title={supply ? 'Editar insumo' : 'Nuevo insumo'}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {error && <Grid size={12}><Alert severity="error">{error}</Alert></Grid>}

          {/* ---- Image upload area ---- */}
          <Grid size={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Imagen del insumo</Typography>
            {imagePreview ? (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Vista previa"
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    bgcolor: 'action.hover',
                  }}
                />
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                    '&:hover': { bgcolor: 'error.dark' },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                sx={{
                  border: 2,
                  borderStyle: 'dashed',
                  borderColor: dragOver ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: dragOver ? 'action.hover' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                }}
              >
                <CloudUpload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Haz clic o arrastra una imagen aquí
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  JPG, PNG, WebP o GIF — máx. 5 MB
                </Typography>
              </Box>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              hidden
              onChange={handleFileChange}
            />
          </Grid>

          {/* ---- Text fields ---- */}
          <Grid size={12}>
            <TextField label="Nombre" value={form.nombre} onChange={set('nombre')} required fullWidth />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Descripción"
              value={form.descripcion}
              onChange={set('descripcion')}
              fullWidth
              multiline
              minRows={2}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Unidad" value={form.unidad} onChange={set('unidad')} fullWidth />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Precio unitario"
              type="number"
              value={form.precio_unitario}
              onChange={set('precio_unitario')}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0, step: '0.01' },
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Stock actual"
              type="number"
              value={form.stock_actual}
              onChange={set('stock_actual')}
              fullWidth
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Stock mínimo"
              type="number"
              value={form.stock_minimo}
              onChange={set('stock_minimo')}
              fullWidth
              slotProps={{ input: { inputProps: { min: 0 } } }}
            />
          </Grid>
        </Grid>

        <DialogActions sx={{ px: 0, pt: 2 }}>
          <Button onClick={onClose} disabled={isBusy}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isBusy}>
            {uploading
              ? <><CircularProgress size={18} sx={{ mr: 1 }} color="inherit" />Subiendo imagen…</>
              : saving ? 'Guardando…' : 'Guardar'
            }
          </Button>
        </DialogActions>
      </form>
    </FormModal>
  );
}
