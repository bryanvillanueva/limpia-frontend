import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, Alert, Paper, Chip,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  alpha, TextField, InputAdornment, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from '@mui/material';
import { ArrowBack, CheckCircle, FileDownload, Search } from '@mui/icons-material';
import { getReportById, updateReportStatus, exportExcel } from '../../services/reports.service';
import { useAuth } from '../../context/AuthContext';

const ESTADO_CHIP = {
  Borrador:  { label: 'Borrador',  color: 'default' },
  Enviado:   { label: 'Enviado',   color: 'warning' },
  Pagado:    { label: 'Pagado',    color: 'success' },
  Devuelto:  { label: 'Devuelto',  color: 'error' },
  Eliminado: { label: 'Eliminado', color: 'default' },
};

const ESTADOS_VALIDOS = ['Borrador', 'Enviado', 'Pagado', 'Devuelto', 'Eliminado'];

const DAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];

/** Parse date string to local Date.
 *  Handles ISO timestamps (e.g. "2026-03-08T13:00:00.000Z") by using
 *  the browser's local timezone conversion, and plain "YYYY-MM-DD" directly. */
function parseDateLocal(str) {
  if (!str) return null;
  if (str.includes('T')) {
    // Full ISO — let Date parse it and use local date parts
    const d = new Date(str);
    return isNaN(d) ? null : d;
  }
  // Plain YYYY-MM-DD — parse without timezone shift
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Format a Date object to YYYY-MM-DD using local date parts */
function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateStr(d) {
  return toDateStr(d);
}

function fmtShortDate(dateStr) {
  const d = parseDateLocal(dateStr);
  return d ? d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' }) : dateStr;
}


function fmtVal(v) {
  if (!v || v === 0) return '';
  return v % 1 === 0 ? String(v) : v.toFixed(2);
}

/** Generate array of 7 date strings (Mon-Sun) starting from a Monday */
function generateWeekDates(mondayDate) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(d.getDate() + i);
    return formatDateStr(d);
  });
}

/** Get Monday of the week containing a date */
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

/** A single week table — reused for week 1 and week 2 */
function WeekTable({ weekNum, weekDates, sites, dayTotals, weekGrandTotal, siteSearch, onSiteSearchChange }) {
  if (!weekDates || weekDates.length === 0) return null;

  // Filter sites that have data in this week
  const weekSites = sites.filter(site =>
    weekDates.some(d => (site.days[d]?.total || 0) > 0)
  ).filter(site => {
    if (!siteSearch) return true;
    const q = siteSearch.toLowerCase();
    return site.sitio?.toLowerCase().includes(q) || site.suburb?.toLowerCase().includes(q);
  });

  if (weekSites.length === 0 && !siteSearch) return null;

  const cellBorder = '1px solid';

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, gap: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Semana {weekNum} — desde {fmtShortDate(weekDates[0])}
        </Typography>
        <TextField
          size="small"
          placeholder="Buscar sitio..."
          value={siteSearch}
          onChange={(e) => onSiteSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
              ),
            },
          }}
          sx={{ width: 220 }}
        />
      </Box>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}
      >
        <Table size="small" sx={{ minWidth: 800, '& td, & th': { borderRight: cellBorder, borderColor: 'divider' }, '& td:last-child, & th:last-child': { borderRight: 'none' } }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  minWidth: 200,
                  position: 'sticky',
                  left: 0,
                  bgcolor: 'background.paper',
                  zIndex: 2,
                }}
              >
                Sitio
              </TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 100 }}>
                Frecuencia
              </TableCell>
              {weekDates.map((date, i) => (
                <TableCell key={date} align="center" sx={{ fontWeight: 700, minWidth: 55, px: 0.5 }}>
                  <Typography variant="caption" display="block" fontWeight={700}>
                    {DAY_LABELS[i]}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                    {fmtShortDate(date)}
                  </Typography>
                </TableCell>
              ))}
              <TableCell align="left" sx={{ fontWeight: 700, minWidth: 120 }}>
                Comentarios
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, minWidth: 65 }}>
                Total
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {weekSites.map((site) => {
              const weekTotal = weekDates.reduce((s, d) => s + (site.days[d]?.total || 0), 0);

              // Collect comments for this site in this week
              const weekComments = (site.comments || [])
                .filter(c => weekDates.includes(c.fecha))
                .map(c => c.observaciones)
                .filter(Boolean);

              return (
                <TableRow key={site.site_id} hover>
                  <TableCell
                    sx={{
                      py: 1,
                      position: 'sticky',
                      left: 0,
                      bgcolor: 'background.paper',
                      zIndex: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {site.sitio}
                    </Typography>
                    {site.suburb && (
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {site.suburb}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell sx={{ py: 1 }}>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {site.frecuencia || '—'}
                    </Typography>
                  </TableCell>

                  {weekDates.map((date) => {
                    const val = site.days[date]?.total || 0;
                    return (
                      <TableCell key={date} align="center" sx={{ px: 0.5, py: 0.75 }}>
                        {val > 0 && (
                          <Typography variant="caption" fontWeight={600}>
                            {fmtVal(val)}
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell sx={{ py: 0.75, maxWidth: 200 }}>
                    {weekComments.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {weekComments.join('; ')}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="center" sx={{ py: 0.75 }}>
                    <Typography variant="body2" fontWeight={700} color="primary.main">
                      {fmtVal(weekTotal)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Totals row */}
            <TableRow sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.04) }}>
              <TableCell
                sx={{
                  py: 1.5,
                  position: 'sticky',
                  left: 0,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                  zIndex: 1,
                }}
              >
                <Typography variant="body2" fontWeight={700}>TOTAL</Typography>
              </TableCell>
              <TableCell />
              {weekDates.map((date) => {
                const val = dayTotals[date] || 0;
                return (
                  <TableCell key={date} align="center" sx={{ px: 0.5, py: 0.75 }}>
                    <Typography variant="caption" fontWeight={700} color="primary.main">
                      {fmtVal(val)}
                    </Typography>
                  </TableCell>
                );
              })}
              <TableCell />
              <TableCell align="center" sx={{ py: 0.75 }}>
                <Typography variant="body2" fontWeight={800} color="primary.main">
                  {fmtVal(weekGrandTotal)}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const canChangeStatus = user?.rol === 'admin' || user?.rol === 'accountant';
  const backPath = location.pathname.startsWith('/mis-reportes') ? '/mis-reportes' : '/reportes';

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [siteSearch1, setSiteSearch1] = useState('');
  const [siteSearch2, setSiteSearch2] = useState('');
  const [statusDialog, setStatusDialog] = useState(false);
  const [newEstado, setNewEstado] = useState('');
  const [invoiceRef, setInvoiceRef] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setReport(await getReportById(id)); }
    catch { setError('Error al cargar reporte'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const openStatusDialog = () => {
    setNewEstado(report?.estado || 'Enviado');
    setInvoiceRef(report?.invoice_reference_number || '');
    setStatusDialog(true);
  };

  const handleStatusChange = async () => {
    setSaving(true);
    try {
      const body = { estado: newEstado };
      if (newEstado === 'Pagado') body.invoice_reference_number = invoiceRef;
      await updateReportStatus(id, body);
      setStatusDialog(false);
      load();
    } catch (err) { setError(err.response?.data?.message || 'Error al cambiar estado'); }
    finally { setSaving(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try { await exportExcel(id); }
    catch { setError('Error al exportar Excel'); }
    finally { setExporting(false); }
  };

  // Derive week dates, day totals, and grand total from the data
  // (handles cases where backend returns empty week_dates/day_totals)
  const computed = useMemo(() => {
    if (!report?.grid) return null;
    const grid = report.grid;
    // Keep site order as returned by the backend (matches planner order)
    const sites = grid.sites || [];

    // 1. Determine week dates — use backend's if available, else derive from fecha_inicio/fecha_fin
    let week1 = grid.week1_dates?.length > 0 ? grid.week1_dates : [];
    let week2 = grid.week2_dates?.length > 0 ? grid.week2_dates : [];

    if (week1.length === 0 || week2.length === 0) {
      const startDate = parseDateLocal(report.fecha_inicio);
      const endDate = parseDateLocal(report.fecha_fin);
      if (startDate && endDate) {
        const monday1 = getMonday(startDate);
        const monday2 = getMonday(endDate);
        // If both Mondays are the same, it's a single week — derive week2 as +7
        if (monday1.getTime() === monday2.getTime()) {
          if (week1.length === 0) week1 = generateWeekDates(monday1);
          const m2 = new Date(monday1);
          m2.setDate(m2.getDate() + 7);
          if (week2.length === 0) week2 = generateWeekDates(m2);
        } else {
          if (week1.length === 0) week1 = generateWeekDates(monday1);
          if (week2.length === 0) week2 = generateWeekDates(monday2);
        }
      }
    }

    // 2. Compute day totals from site data
    const dayTotals = {};
    const allDates = [...week1, ...week2];
    for (const date of allDates) {
      dayTotals[date] = sites.reduce((sum, site) => sum + (site.days[date]?.total || 0), 0);
    }

    // 3. Compute grand total
    const grandTotal = Object.values(dayTotals).reduce((s, v) => s + v, 0);

    // 4. Week totals
    const week1Total = week1.reduce((s, d) => s + (dayTotals[d] || 0), 0);
    const week2Total = week2.reduce((s, d) => s + (dayTotals[d] || 0), 0);

    return { week1, week2, sites, dayTotals, grandTotal, week1Total, week2Total };
  }, [report]);

  if (loading) return <Typography sx={{ p: 2 }}>Cargando...</Typography>;
  if (!report) return <Typography sx={{ p: 2 }}>Reporte no encontrado</Typography>;

  const summary = report.summary || null;
  const estadoKey = report.estado || 'Enviado';
  const chipData = ESTADO_CHIP[estadoKey] ?? ESTADO_CHIP.Enviado;
  const estadoChip = estadoKey === 'Enviado' && user?.rol === 'accountant'
    ? { ...chipData, label: 'Pendiente' }
    : chipData;

  // Build report title matching Excel filename format
  const reportTitle = (() => {
    const nombre = [report.generado_por, report.generado_por_apellido].filter(Boolean).join(' ')
      || summary?.nombre || '';
    const teamNum = report.grid?.team_numero
      || report.included_logs?.[0]?.team_id
      || '';
    const start = parseDateLocal(report.fecha_inicio);
    const end = parseDateLocal(report.fecha_fin);
    const pad = (n) => String(n).padStart(2, '0');
    const fechaRange = start && end
      ? `semana del ${pad(start.getDate())} ${pad(start.getMonth() + 1)} al ${pad(end.getDate())} ${pad(end.getMonth() + 1)} del ${end.getFullYear()}`
      : '';
    const parts = ['Time Sheet'];
    if (teamNum) parts.push(`Equipo ${teamNum}`);
    if (nombre) parts.push(`(${nombre})`);
    if (fechaRange) parts.push(fechaRange);
    return parts.join(' - ');
  })();

  return (
    <>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate(backPath)}><ArrowBack /></IconButton>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="h6" fontWeight={700}>{reportTitle}</Typography>
        </Box>
        <Chip
          label={estadoChip.label}
          color={estadoChip.color}
          icon={estadoKey === 'Pagado' ? <CheckCircle /> : undefined}
        />
        {report.invoice_reference_number && (
          <Chip label={report.invoice_reference_number} size="small" variant="outlined" />
        )}
        {canChangeStatus && (
          <Button variant="contained" onClick={openStatusDialog}>
            Cambiar estado
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<FileDownload />}
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? 'Exportando...' : 'Excel'}
        </Button>
      </Box>

      {/* Status change dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Cambiar estado del reporte</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            select
            label="Estado"
            value={newEstado}
            onChange={(e) => setNewEstado(e.target.value)}
            fullWidth
          >
            {ESTADOS_VALIDOS.map(e => (
              <MenuItem key={e} value={e}>{e}</MenuItem>
            ))}
          </TextField>
          {newEstado === 'Pagado' && (
            <TextField
              label="N° de referencia del invoice"
              value={invoiceRef}
              onChange={(e) => setInvoiceRef(e.target.value)}
              fullWidth
              required
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleStatusChange}
            disabled={saving || (newEstado === 'Pagado' && !invoiceRef.trim())}
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Summary bar */}
      {summary && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
            {summary.nombre && (
              <Box>
                <Typography variant="caption" color="text.secondary">Limpiador</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {summary.nombre} {summary.apellido || ''}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary">Total horas</Typography>
              <Typography variant="body1" fontWeight={700} color="primary.main">
                {fmtVal(computed?.grandTotal) || '0'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Sitios</Typography>
              <Typography variant="body1" fontWeight={600}>{computed?.sites?.length || 0}</Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Week tables stacked */}
      {computed ? (
        <>
          <WeekTable
            weekNum={1}
            weekDates={computed.week1}
            sites={computed.sites}
            dayTotals={computed.dayTotals}
            weekGrandTotal={computed.week1Total}
            siteSearch={siteSearch1}
            onSiteSearchChange={setSiteSearch1}
          />
          <WeekTable
            weekNum={2}
            weekDates={computed.week2}
            sites={computed.sites}
            dayTotals={computed.dayTotals}
            weekGrandTotal={computed.week2Total}
            siteSearch={siteSearch2}
            onSiteSearchChange={setSiteSearch2}
          />

          {/* Grand total */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body1" fontWeight={700}>TOTAL GENERAL</Typography>
            <Typography variant="h6" fontWeight={800} color="primary.main">
              {fmtVal(computed.grandTotal) || '0'}
            </Typography>
          </Paper>

          {/* Legend */}
          <Typography variant="caption" color="text.secondary">
            15 min = 0.25 | 30 min = 0.50 | 45 min = 0.75 | 60 min = 1.0
          </Typography>
        </>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          Este reporte no tiene datos disponibles.
        </Alert>
      )}
    </>
  );
}
