import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, Alert, Paper, Chip, Collapse,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
} from '@mui/material';
import { ArrowBack, CheckCircle, ExpandMore, ExpandLess } from '@mui/icons-material';
import { getReportById, approveReport } from '../../services/reports.service';
import { useAuth } from '../../context/AuthContext';

const ESTADO_CHIP = {
  borrador: { label: 'Borrador', color: 'default' },
  enviado:  { label: 'Enviado',  color: 'warning' },
  aprobado: { label: 'Aprobado', color: 'success' },
};

const ENTRY_TYPE_LABELS = { SERVICE: 'Service', BINS: 'Bins', CUSTOM: 'Personalizado' };

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isAccountant = user?.rol === 'accountant';
  const backPath = location.pathname.startsWith('/mis-reportes') ? '/mis-reportes' : '/reportes';

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approving, setApproving] = useState(false);
  const [showExcluded, setShowExcluded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setReport(await getReportById(id)); }
    catch { setError('Error al cargar reporte'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async () => {
    setApproving(true);
    try { await approveReport(id); load(); }
    catch (err) { setError(err.response?.data?.message || 'Error al aprobar'); }
    finally { setApproving(false); }
  };

  if (loading) return <Typography sx={{ p: 2 }}>Cargando…</Typography>;
  if (!report) return <Typography sx={{ p: 2 }}>Reporte no encontrado</Typography>;

  const summary = report.summary || null;
  const includedLogs = report.included_logs || [];
  const excludedLogIds = report.excluded_log_ids || [];
  const isApproved = report.estado === 'aprobado' || Boolean(report.aprobado);
  const estadoKey = report.estado ?? (isApproved ? 'aprobado' : 'enviado');
  const estadoChip = ESTADO_CHIP[estadoKey] ?? ESTADO_CHIP.enviado;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <IconButton onClick={() => navigate(backPath)}><ArrowBack /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>Reporte #{report.id}</Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date(report.fecha_inicio).toLocaleDateString()} — {new Date(report.fecha_fin).toLocaleDateString()}
          </Typography>
        </Box>
        <Chip
          label={estadoChip.label}
          color={estadoChip.color}
          icon={isApproved ? <CheckCircle /> : undefined}
        />
        {isAccountant && !isApproved && (
          <Button variant="contained" color="success" disabled={approving} onClick={handleApprove}>
            Aprobar
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Summary */}
      {summary && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5, mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>Resumen</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {summary.nombre && (
              <Box>
                <Typography variant="caption" color="text.secondary">Limpiador</Typography>
                <Typography variant="body1" fontWeight={600}>{summary.nombre}</Typography>
              </Box>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary">Total valor</Typography>
              <Typography variant="body1" fontWeight={600}>${Number(summary.total_valor || 0).toFixed(2)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Total logs</Typography>
              <Typography variant="body1" fontWeight={600}>{summary.total_logs ?? '—'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Entradas bins</Typography>
              <Typography variant="body1" fontWeight={600}>{summary.total_bins_entries ?? '—'}</Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Included logs table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Sitio</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Valor</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Observaciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {includedLogs.map((log, i) => (
              <TableRow key={log.id ?? i} hover>
                <TableCell>{log.site_name || log.nombre || '—'}</TableCell>
                <TableCell>{log.fecha ? new Date(log.fecha).toLocaleDateString() : '—'}</TableCell>
                <TableCell>
                  <Chip
                    label={ENTRY_TYPE_LABELS[log.entry_type] || log.entry_type || '—'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">${Number(log.display_value || 0).toFixed(2)}</TableCell>
                <TableCell>{log.observaciones || '—'}</TableCell>
              </TableRow>
            ))}
            {includedLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  Sin logs incluidos en este reporte
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Excluded logs collapsible */}
      {excludedLogIds.length > 0 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, cursor: 'pointer' }}
            onClick={() => setShowExcluded(v => !v)}
          >
            <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1 }}>
              Logs excluidos ({excludedLogIds.length})
            </Typography>
            {showExcluded ? <ExpandLess /> : <ExpandMore />}
          </Box>
          <Collapse in={showExcluded}>
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                IDs excluidos: {excludedLogIds.join(', ')}
              </Typography>
            </Box>
          </Collapse>
        </Paper>
      )}
    </>
  );
}
