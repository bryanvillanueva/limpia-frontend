import { useState, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography,
  Button, Box, Alert, LinearProgress, Paper, Link, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  Close, Upload, CheckCircle, Error, Download, InsertDriveFile,
  SwapHoriz,
} from '@mui/icons-material';
import { importSites } from '../../services/sites.service';

/**
 * Triggers a CSV file download from in-memory content.
 * @param {string} csvContent - Raw CSV string.
 * @param {string} filename - Download filename.
 */
function downloadCsv(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Downloads a sites-only CSV template (no team assignment columns).
 */
function downloadSitesTemplate() {
  const headers = 'direccion_linea1,direccion_linea2,suburb,state,postcode,country,cliente_id,contrato,finanzas,activo';
  const row1 = '123 Example St,,Sydney,NSW,2000,Australia,1,Contrato A,Notas de finanzas,1';
  const row2 = '456 Demo Ave,Unit 2,Melbourne,VIC,3000,Australia,2,Contrato B,,true';
  downloadCsv(`${headers}\n${row1}\n${row2}`, 'plantilla_sitios.csv');
}

/**
 * Downloads a sites + team assignment CSV template with all assignment columns.
 */
function downloadSitesWithAssignmentTemplate() {
  const headers = 'direccion_linea1,direccion_linea2,suburb,state,postcode,country,cliente_id,team_id,frecuencia,horas_por_trabajador,hace_bins,pago_bins,fecha_asignacion,assignment_activo,contrato,finanzas,activo';
  const row1 = '123 Example St,,Sydney,NSW,2000,Australia,1,,,,,,,,Contrato A,Notas de finanzas,1';
  const row2 = '456 Demo Ave,Unit 2,Melbourne,VIC,3000,Australia,2,3,semanal,4,1,50,2025-03-01,1,Contrato B,,true';
  downloadCsv(`${headers}\n${row1}\n${row2}`, 'plantilla_sitios_con_asignacion.csv');
}

/**
 * SiteImportModal - Modal para importar sitios desde archivos CSV/XLSX.
 * Muestra selector de archivo, progreso de carga y resultados de la importación.
 *
 * @param {boolean} open - Controla la visibilidad del modal.
 * @param {function} onClose - Callback al cerrar el modal.
 * @param {function} onImported - Callback cuando la importación finaliza exitosamente.
 */
export default function SiteImportModal({ open, onClose, onImported }) {
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
   * Maneja la selección de archivo.
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
   * Ejecuta la importación del archivo seleccionado.
   */
  const handleImport = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setResult(null);

    try {
      const data = await importSites(selectedFile);
      setResult(data);
      if ((data.imported > 0 || data.updated > 0) && onImported) {
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
   * Formatea el tamaño del archivo para mostrar.
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Typography variant="h6" component="span">Importar Sitios</Typography>
        <IconButton size="small" onClick={handleClose} disabled={uploading} sx={{ color: 'text.secondary' }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: 'divider' }}>
        {/* Instrucciones */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            Sube un archivo <strong>CSV</strong> o <strong>Excel (.xlsx)</strong> con los sitios a importar.
          </Typography>
          <Typography variant="body2" component="div">
            Columnas requeridas:
            <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
              <li><code>direccion_linea1</code> (o <code>direccion</code>)</li>
              <li><code>cliente_id</code> o <code>cliente_nombre</code></li>
            </ul>
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 0.5 }}>
            Con <code>team_id</code> se asigna al equipo. Columnas de asignación opcionales:
            {' '}<code>frecuencia</code>, <code>horas_por_trabajador</code>, <code>hace_bins</code>,
            {' '}<code>pago_bins</code>, <code>fecha_asignacion</code>, <code>assignment_activo</code>.
          </Typography>
          <Typography variant="body2" component="div" sx={{ mt: 1, color: 'text.secondary' }}>
            <strong>Duplicados:</strong> si ya existe un sitio con la misma dirección y cliente, y los datos son iguales,
            solo se actualiza la asignación de equipo. Si los datos difieren, se crea un sitio nuevo.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
            <Link
              component="button"
              variant="body2"
              onClick={downloadSitesTemplate}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <Download fontSize="small" /> Plantilla solo sitios
            </Link>
            <Link
              component="button"
              variant="body2"
              onClick={downloadSitesWithAssignmentTemplate}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <Download fontSize="small" /> Plantilla sitios + asignación a equipo
            </Link>
          </Box>
        </Alert>

        {/* Selector de archivo */}
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

        {/* Progreso de carga */}
        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Procesando archivo...
            </Typography>
          </Box>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Resultados de la importación */}
        {result && (
          <Box sx={{ mt: 2 }}>
            <Alert
              severity={Number(result.failed) === 0 ? 'success' : (Number(result.imported) > 0 || Number(result.updated) > 0) ? 'warning' : 'error'}
              icon={Number(result.failed) === 0 ? <CheckCircle /> : <Error />}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">
                {result.message || 'Importación completada'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {Number(result.imported) > 0 && (
                  <Chip
                    size="small"
                    icon={<CheckCircle />}
                    label={`${result.imported} importados`}
                    color="success"
                    variant="outlined"
                  />
                )}
                {Number(result.updated) > 0 && (
                  <Chip
                    size="small"
                    icon={<SwapHoriz />}
                    label={`${result.updated} asignaciones actualizadas`}
                    color="info"
                    variant="outlined"
                  />
                )}
                {Number(result.failed) > 0 && (
                  <Chip
                    size="small"
                    icon={<Error />}
                    label={`${result.failed} fallidos`}
                    color="error"
                    variant="outlined"
                  />
                )}
                {Number(result.imported) === 0 && Number(result.updated) === 0 && Number(result.failed) === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Los sitios ya existían con datos idénticos. No se realizaron cambios.
                  </Typography>
                )}
              </Box>
            </Alert>

            {/* Detalle de errores */}
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
