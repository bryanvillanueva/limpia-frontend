import { useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Typography, Chip, IconButton, Tooltip, Skeleton, alpha,
} from '@mui/material';
import { Add, Delete, Comment } from '@mui/icons-material';
import EmptyState from './EmptyState';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const TYPE_STYLES = {
  SERVICE: { bg: '#e8f5e9', fg: '#2e7d32', label: 'SRV' },
  BINS:    { bg: '#e3f2fd', fg: '#1565c0', label: 'BINS' },
};

/**
 * Builds a lookup { [day_of_week]: item[] } from a flat items array.
 * Enables O(1) access when rendering each day cell.
 * @param {Array} items - Plan items with day_of_week key.
 * @returns {Object} Map of day_of_week (1-7) to array of items for that day.
 */
function buildDayMap(items) {
  const map = {};
  for (const item of items) {
    const d = item.day_of_week;
    if (!map[d]) map[d] = [];
    map[d].push(item);
  }
  return map;
}

/**
 * Renders a single item chip inside a day cell.
 * Shows display_value, entry_type badge, and a delete button on hover.
 */
function ItemChip({ item, onDelete }) {
  const style = TYPE_STYLES[item.entry_type] || TYPE_STYLES.SERVICE;
  const value = parseFloat(item.display_value);
  const label = item.entry_type === 'BINS'
    ? `$${value.toFixed(2)}`
    : `${value}h`;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        bgcolor: style.bg,
        color: style.fg,
        borderRadius: 1,
        px: 0.75,
        py: 0.25,
        mb: 0.5,
        fontSize: '0.75rem',
        fontWeight: 600,
        '&:hover .delete-btn': { opacity: 1 },
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
        {label}
      </Typography>
      {onDelete && (
        <IconButton
          className="delete-btn"
          size="small"
          onClick={(e) => { e.stopPropagation(); onDelete(item); }}
          sx={{ opacity: 0, ml: 'auto', p: 0.25, color: 'inherit', transition: 'opacity 0.15s' }}
        >
          <Delete sx={{ fontSize: 14 }} />
        </IconButton>
      )}
    </Box>
  );
}

/**
 * Reusable weekly table grid — sites as rows, days (Mon–Sun) as columns.
 * Each cell displays SERVICE/BINS items as colored chips.
 * Footer row shows per-day totals.
 *
 * Designed for reuse in logs, historial, payment claim pages.
 *
 * @param {Array}    plans       - Plan objects with nested items.
 * @param {Object}   dayTotals   - { [day_of_week]: totalValue }.
 * @param {boolean}  loading     - Show skeleton placeholders.
 * @param {Function} onDeleteItem - Called with item object when user clicks delete.
 * @param {Function} onAddItem   - Called with { planId, siteId, dayOfWeek } to open add-item modal.
 * @param {Function} onEditPlan  - Called with plan object to edit week_comment.
 */
export default function WeekTableGrid({ plans, dayTotals, loading, onDeleteItem, onAddItem, onEditPlan }) {
  const enrichedPlans = useMemo(() =>
    (plans || []).map(plan => ({
      ...plan,
      dayMap: buildDayMap(plan.items || []),
    })),
    [plans],
  );

  if (loading) {
    return (
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Sitio</TableCell>
              {DAY_LABELS.map(d => (
                <TableCell key={d} align="center" sx={{ fontWeight: 700, minWidth: 100 }}>{d}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3].map(i => (
              <TableRow key={i}>
                <TableCell><Skeleton width={140} /></TableCell>
                {DAY_LABELS.map((_, j) => (
                  <TableCell key={j} align="center"><Skeleton width={60} /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!enrichedPlans.length) {
    return <EmptyState message="No hay items planificados para esta semana" />;
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Sitio</TableCell>
            {DAY_LABELS.map((label, idx) => (
              <TableCell key={idx} align="center" sx={{ fontWeight: 700, minWidth: 110 }}>
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {enrichedPlans.map(plan => (
            <TableRow key={plan.plan_id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
              {/* Site info cell */}
              <TableCell sx={{ verticalAlign: 'top', py: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {plan.direccion_linea1 || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {[plan.suburb, plan.state, plan.postcode].filter(Boolean).join(', ')}
                    </Typography>
                    {plan.cliente_nombre && (
                      <Typography variant="caption" color="primary.main" fontWeight={500} noWrap display="block">
                        {plan.cliente_nombre}
                      </Typography>
                    )}
                  </Box>
                  {plan.week_comment && (
                    <Tooltip title={plan.week_comment}>
                      <IconButton
                        size="small"
                        onClick={() => onEditPlan?.(plan)}
                        sx={{ p: 0.25, color: 'text.secondary' }}
                      >
                        <Comment sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>

              {/* Day cells (1-7) */}
              {DAY_LABELS.map((_, dayIdx) => {
                const dayNum = dayIdx + 1;
                const items = plan.dayMap[dayNum] || [];

                return (
                  <TableCell
                    key={dayNum}
                    align="center"
                    sx={{
                      verticalAlign: 'top',
                      py: 1,
                      px: 0.75,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      minWidth: 110,
                    }}
                    onClick={() => onAddItem?.({ planId: plan.plan_id, siteId: plan.site_id, dayOfWeek: dayNum })}
                  >
                    {items.length > 0 ? (
                      items.map(item => (
                        <ItemChip key={item.item_id} item={item} onDelete={onDeleteItem} />
                      ))
                    ) : (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: 28,
                          opacity: 0,
                          transition: 'opacity 0.15s',
                          'td:hover &': { opacity: 0.5 },
                        }}
                      >
                        <Add sx={{ fontSize: 16, color: 'text.disabled' }} />
                      </Box>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}

          {/* Totals footer row */}
          <TableRow sx={{ bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) }}>
            <TableCell sx={{ fontWeight: 700, py: 1.5 }}>
              <Typography variant="body2" fontWeight={700}>TOTAL</Typography>
            </TableCell>
            {DAY_LABELS.map((_, dayIdx) => {
              const dayNum = dayIdx + 1;
              const total = dayTotals?.[String(dayNum)] ?? 0;
              return (
                <TableCell key={dayNum} align="center" sx={{ py: 1.5 }}>
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
