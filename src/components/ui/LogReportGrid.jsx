import { useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Typography, Chip, Tooltip, Skeleton, alpha,
} from '@mui/material';
import EmptyState from './EmptyState';

const TYPE_STYLES = {
  SERVICE: { bg: '#e8f5e9', fg: '#2e7d32', label: 'SRV' },
  BINS:    { bg: '#e3f2fd', fg: '#1565c0', label: 'BINS' },
  CUSTOM:  { bg: '#fff3e0', fg: '#e65100', label: 'OTR' },
};

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

/** Parses YYYY-MM-DD without timezone drift. */
function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Returns 0-6 (Mon–Sun) relative to weekStart, or -1 if outside the week. */
function dayIndex(dateStr, weekStart) {
  const logDate = parseDate(dateStr.slice(0, 10));
  const diff = Math.round((logDate - weekStart) / 86400000);
  return diff >= 0 && diff <= 6 ? diff : -1;
}

function LogEntry({ log }) {
  const style = TYPE_STYLES[log.entry_type] || TYPE_STYLES.SERVICE;
  const value = Number(log.display_value || 0);
  const valueLabel = log.entry_type === 'BINS'
    ? `$${value.toFixed(2)}`
    : log.entry_type === 'SERVICE'
      ? `${value}h`
      : value.toFixed(2);

  const chip = (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        bgcolor: style.bg,
        color: style.fg,
        borderRadius: 1,
        px: 0.75,
        py: 0.25,
        fontWeight: 600,
      }}
    >
      <Chip
        label={style.label}
        size="small"
        sx={{
          height: 18,
          fontSize: '0.625rem',
          fontWeight: 700,
          bgcolor: alpha(style.fg, 0.15),
          color: style.fg,
          '& .MuiChip-label': { px: 0.5 },
        }}
      />
      <Typography variant="caption" sx={{ fontWeight: 600, color: 'inherit', lineHeight: 1 }}>
        {valueLabel}
      </Typography>
    </Box>
  );

  return log.observaciones
    ? <Tooltip title={log.observaciones} arrow>{chip}</Tooltip>
    : chip;
}

/**
 * Read-only grid — sites as rows, Mon–Sun as columns for the selected week.
 * Each cell shows SERVICE/BINS/CUSTOM chips for logged entries.
 * Observaciones visible as tooltip on hover.
 *
 * @param {Array}  logs          - Log objects: { id, site_id, site_name, fecha, entry_type, display_value, observaciones }
 * @param {Date}   weekStartDate - Monday of the week to display (JS Date, local midnight).
 * @param {boolean} loading      - Show skeleton while data loads.
 */
export default function LogReportGrid({ logs = [], weekStartDate, loading }) {
  /** Column descriptors: { name, date, label } for each day Mon–Sun. */
  const columns = useMemo(() => {
    if (!weekStartDate) return DAY_NAMES.map(name => ({ name, label: '' }));
    return DAY_NAMES.map((name, i) => {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + i);
      return {
        name,
        label: d.toLocaleDateString('es-AU', { day: '2-digit', month: '2-digit' }),
      };
    });
  }, [weekStartDate]);

  /** Groups logs into { rows[], dayTotals{} } for the current week. */
  const { rows, dayTotals } = useMemo(() => {
    if (!weekStartDate) return { rows: [], dayTotals: {} };

    const siteMap = {};
    const totals = {};

    for (const log of logs) {
      const idx = dayIndex(log.fecha, weekStartDate);
      if (idx === -1) continue; // outside this week

      const key = log.site_id;
      if (!siteMap[key]) {
        siteMap[key] = {
          site_id: log.site_id,
          site_name: log.site_name || `Sitio ${log.site_id}`,
          days: {},
        };
      }
      if (!siteMap[key].days[idx]) siteMap[key].days[idx] = [];
      siteMap[key].days[idx].push(log);

      totals[idx] = (totals[idx] || 0) + Number(log.display_value || 0);
    }

    return { rows: Object.values(siteMap), dayTotals: totals };
  }, [logs, weekStartDate]);

  if (loading) {
    return (
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Sitio</TableCell>
              {DAY_NAMES.map(d => (
                <TableCell key={d} align="center" sx={{ fontWeight: 700, minWidth: 100 }}>{d}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3].map(i => (
              <TableRow key={i}>
                <TableCell><Skeleton width={140} /></TableCell>
                {DAY_NAMES.map((_, j) => (
                  <TableCell key={j} align="center"><Skeleton width={60} /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!rows.length) {
    return <EmptyState message="No hay registros en esta semana" />;
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Sitio</TableCell>
            {columns.map((col, i) => (
              <TableCell key={i} align="center" sx={{ fontWeight: 700, minWidth: 110 }}>
                <Typography variant="caption" display="block" fontWeight={700}>{col.name}</Typography>
                <Typography variant="caption" color="text.secondary">{col.label}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map(row => (
            <TableRow key={row.site_id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
              <TableCell sx={{ verticalAlign: 'top', py: 1.5 }}>
                <Typography variant="body2" fontWeight={600}>{row.site_name}</Typography>
              </TableCell>
              {columns.map((_, dayIdx) => {
                const dayLogs = row.days[dayIdx] || [];
                return (
                  <TableCell
                    key={dayIdx}
                    align="center"
                    sx={{ verticalAlign: 'top', py: 1, px: 0.75, minWidth: 110 }}
                  >
                    {dayLogs.map(log => (
                      <Box key={log.id} sx={{ mb: 0.5 }}>
                        <LogEntry log={log} />
                      </Box>
                    ))}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}

          {/* Totals footer */}
          <TableRow sx={{ bgcolor: theme => alpha(theme.palette.primary.main, 0.04) }}>
            <TableCell sx={{ py: 1.5 }}>
              <Typography variant="body2" fontWeight={700}>TOTAL</Typography>
            </TableCell>
            {columns.map((_, dayIdx) => {
              const total = dayTotals[dayIdx] ?? 0;
              return (
                <TableCell key={dayIdx} align="center" sx={{ py: 1.5 }}>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    {total > 0 ? total.toFixed(2) : '—'}
                  </Typography>
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
