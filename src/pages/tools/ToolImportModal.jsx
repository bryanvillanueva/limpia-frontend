import { useState, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography,
  Button, Box, Alert, LinearProgress, Paper, Link, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  Close, Upload, CheckCircle, Error, Download, InsertDriveFile,
} from '@mui/icons-material';
import { importTools } from '../../services/tools.service';

/**
 * Genera y descarga una plantilla CSV de ejemplo para la importación de herramientas.
 * Incluye filas de ejemplo: una herramienta en oficina y dos asignadas a equipos.
 */
function downloadTemplate() {
  const headers = 'nombre,code,descripcion,requiere_mantenimiento,fecha_ultimo_mantenimiento,precio_unitario,ubicacion,equipo_id';
  const row1 = 'Aspiradora Industrial,ASP-01,Uso pesado,1,2025-01-15,299.99,oficina,';
  const row2 = 'Cubo y fregona,CUB-02,,0,,,asignada,3';
  const row3 = 'Escalera,ESC-03,Mantenimiento,1,,89.50,asignada,2';
  const csvContent = `${headers}\n${row1}\n${row2}\n${row3}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla_herramientas.csv';
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * ToolImportModal - Modal para importar herramientas desde archivos CSV/XLSX.
 * Muestra selector de archivo, progreso de carga y resultados de la importación.
 *
 * @param {boolean} open - Controla la visibilidad del modal.
 * @param {function} onClose - Callback al cerrar el modal.
 * @param {function} onImported - Callback cuando la importación finaliza exitosamente.
 */
export default function ToolImportModal({ open, onClose, onImported }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  /**
   * Reinicia el estado del modal al cerrarlo.
   */
  const handleClose = () => {
    if (uploading) return;
    setSelectedFile(null);
    setResult(null);
    setError('');
    onClose();
  };

  /**
   * Maneja la selección de archivo y valida tipo/extensión.
   */
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

      if (!validTypes.includes(file.type) && !hasValidExtension) {
        setError('Por favor selecciona un archivo CSV o Excel (.xlsx)');
        return;
      }
      setSelectedFile(file);
      setError('');
      setResult(null);
    }
  };

  /**
   * Ejecuta la importación del archivo seleccionado via POST /tools/import.
   */
  const handleImport = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setResult(null);

    try {
      const data = await importTools(selectedFile);
      setResult(data);
      if (data.imported > 0 && onImported) {
        onImported();
      }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Error al importar el archivo';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Formatea bytes a una cadena legible (B / KB / MB).
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" component="span">Importar Herramientas</Typography>
        <IconButton size="small" onClick={handleClose} disabled={uploading} sx={{ color: 'text.secondary' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'divider' }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Sube un archivo <strong>CSV</strong> o <strong>Excel (.xlsx)</strong> con las herramientas a importar.
          </Typography>
          <Typography variant="body2" component="div">
            Columna requerida:
            <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
              <li><code>nombre</code></li>
            </ul>
          </Typography>
          <Typography variant="body2" component="div">
            Columnas opcionales: <code>code</code>, <code>descripcion</code>,{' '}
            <code>requiere_mantenimiento</code>, <code>fecha_ultimo_mantenimiento</code>,{' '}
            <code>precio_unitario</code>, <code>ubicacion</code>, <code>equipo_id</code>.
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
            <strong>ubicacion</strong>: <code>oficina</code> (por defecto) u <code>asignada</code>.
            Cuando es <code>asignada</code>, <code>equipo_id</code> es obligatorio y debe ser un equipo existente.
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={downloadTemplate}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}
          >
            <Download fontSize="small" /> Descargar plantilla CSV
          </Link>
        </Alert>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            cursor: uploading ? 'default' : 'pointer',
            bgcolor: 'background.default',
            borderStyle: 'dashed',
            transition: 'border-color 0.2s',
            '&:hover': uploading ? {} : { borderColor: 'primary.main' },
          }}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {selectedFile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <InsertDriveFile color="primary" />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" fontWeight={600}>{selectedFile.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(selectedFile.size)}
                </Typography>
              </Box>
            </Box>
          ) : (
            <>
              <Upload sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Haz clic o arrastra un archivo aquí
              </Typography>
              <Typography variant="caption" color="text.disabled">
                CSV, XLS, XLSX (máx. 5MB)
              </Typography>
            </>
          )}
        </Paper>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Procesando archivo...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Box sx={{ mt: 2 }}>
            <Alert
              severity={result.failed === 0 ? 'success' : result.imported > 0 ? 'warning' : 'error'}
              icon={result.failed === 0 ? <CheckCircle /> : <Error />}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">
                {result.message || 'Importación completada'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  size="small"
                  icon={<CheckCircle />}
                  label={`${result.imported} importadas`}
                  color="success"
                  variant="outlined"
                />
                {result.failed > 0 && (
                  <Chip
                    size="small"
                    icon={<Error />}
                    label={`${result.failed} fallidas`}
                    color="error"
                    variant="outlined"
                  />
                )}
              </Box>
            </Alert>

            {result.errors?.length > 0 && (
              <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 200 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: 80 }}>Fila</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.errors.map((err, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{err.row}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="error.main">
                            {err.message}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={uploading}>
          {result ? 'Cerrar' : 'Cancelar'}
        </Button>
        {!result && (
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={!selectedFile || uploading}
            startIcon={<Upload />}
          >
            {uploading ? 'Importando...' : 'Importar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
