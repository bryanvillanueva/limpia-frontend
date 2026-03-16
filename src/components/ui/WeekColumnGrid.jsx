import { useState } from 'react';
import {
  Box, Typography, IconButton, Button, Skeleton, Popover, alpha,
} from '@mui/material';
import { Delete, Circle, RemoveCircleOutline, Add } from '@mui/icons-material';
import EmptyState from './EmptyState';

const DAY_LABELS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

const COLOR_MAP = {
  yellow: { bg: '#FFF9C4', border: '#F9A825' },
  red:    { bg: '#FFCDD2', border: '#E53935' },
  green:  { bg: '#C8E6C9', border: '#43A047' },
  blue:   { bg: '#BBDEFB', border: '#1E88E5' },
};

const COLOR_OPTIONS = ['yellow', 'red', 'green', 'blue'];

function getFreqStyle(frecuencia) {
  if (!frecuencia) return null;
  const lower = frecuencia.toLowerCase();
  if (lower.startsWith('mensual'))    return { color: '#43A047', label: 'MENSUAL' };
  if (lower.startsWith('quincenal')) return { color: '#1E88E5', label: 'QUINCENAL' };
  // semanal → no tag
  return null;
}

/**
 * Color picker popover — 4 colored circles + a clear button.
 */
function ColorPicker({ anchorEl, open, onClose, currentColor, onChange }) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      slotProps={{ paper: { sx: { p: 1, display: 'flex', gap: 0.5, alignItems: 'center' } } }}
    >
      {COLOR_OPTIONS.map(c => (
        <IconButton
          key={c}
          size="small"
          onClick={() => { onChange(c); onClose(); }}
          sx={{
            p: 0.25,
            border: currentColor === c ? '2px solid' : '2px solid transparent',
            borderColor: currentColor === c ? COLOR_MAP[c].border : 'transparent',
          }}
        >
          <Circle sx={{ fontSize: 20, color: COLOR_MAP[c].border }} />
        </IconButton>
      ))}
      <IconButton
        size="small"
        onClick={() => { onChange(null); onClose(); }}
        sx={{ p: 0.25 }}
      >
        <RemoveCircleOutline sx={{ fontSize: 20, color: 'text.disabled' }} />
      </IconButton>
    </Popover>
  );
}

/**
 * A single site row within a day column.
 */
function SiteRow({ plan, dayItems, editable, onEntryClick, onDeleteItem, onColorChange }) {
  const [colorAnchor, setColorAnchor] = useState(null);
  const colorStyle = plan.color && COLOR_MAP[plan.color] ? COLOR_MAP[plan.color] : null;

  const totalValue = dayItems.reduce((sum, it) => sum + Number(it.display_value), 0);
  const types = dayItems.map(i => i.entry_type);
  const hasBins = types.includes('BINS');
  const hasService = types.includes('SERVICE');
  const hasCustom = types.includes('CUSTOM');
  const freq = plan.frecuencia;
  const freqStyle = getFreqStyle(freq);

  const handleCardClick = () => {
    // Don't open modal if color picker is open
    if (colorAnchor) return;
    onEntryClick?.(plan, dayItems);
  };

  return (
    <Box
      sx={{
        bgcolor: colorStyle ? colorStyle.bg : 'background.paper',
        borderLeft: colorStyle ? `3px solid ${colorStyle.border}` : '3px solid transparent',
        borderRadius: 1,
        px: 1,
        py: 0.75,
        mb: 0.5,
        cursor: editable ? 'pointer' : 'default',
        '&:hover .row-actions': { opacity: 1 },
        transition: 'background-color 0.15s',
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" fontWeight={700} noWrap display="block" sx={{ fontSize: '0.7rem', lineHeight: 1.3 }}>
            {plan.direccion_linea1 || '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: '0.625rem', lineHeight: 1.2 }}>
            {plan.suburb || ''}
          </Typography>
          {(hasBins || hasService || hasCustom || freq) && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.25 }}>
              {hasBins && (
                <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1.2, color: 'text.secondary', fontWeight: 600 }}>
                  BINS
                </Typography>
              )}
              {hasService && (
                <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1.2, color: 'text.secondary', fontWeight: 600 }}>
                  SERVICE
                </Typography>
              )}
              {hasCustom && (
                <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1.2, color: '#e65100', fontWeight: 600 }}>
                  OTRO
                </Typography>
              )}
              {freq && freqStyle && (
                <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1.2, color: freqStyle.color, fontWeight: 700 }}>
                  {freqStyle.label}
                </Typography>
              )}
            </Box>
          )}
        </Box>
        <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.75rem', whiteSpace: 'nowrap', mt: 0.25 }}>
          {totalValue > 0 ? `${totalValue}h` : ''}
        </Typography>
      </Box>

      {/* Comments — always visible */}
      {(plan.week_comment || dayItems.some(i => i.item_comment)) && (
        <Box sx={{ mt: 0.25 }}>
          {plan.week_comment && (
            <Typography variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1.3, color: 'text.secondary', fontStyle: 'italic', display: 'block' }}>
              {plan.week_comment}
            </Typography>
          )}
          {dayItems.map(item => item.item_comment ? (
            <Typography key={item.item_id} variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1.3, color: 'text.secondary', fontStyle: 'italic', display: 'block' }}>
              {item.item_comment}
            </Typography>
          ) : null)}
        </Box>
      )}

      {/* Row actions — visible on hover */}
      {editable && (
        <Box
          className="row-actions"
          sx={{
            display: 'flex',
            gap: 0.25,
            mt: 0.25,
            opacity: 0,
            transition: 'opacity 0.15s',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {onColorChange && (
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); setColorAnchor(e.currentTarget); }}
              sx={{ p: 0.25 }}
            >
              <Circle sx={{ fontSize: 12, color: colorStyle ? colorStyle.border : 'text.disabled' }} />
            </IconButton>
          )}
          {dayItems.map(item => (
            <IconButton
              key={item.item_id}
              size="small"
              onClick={(e) => { e.stopPropagation(); onDeleteItem?.(item); }}
              sx={{ p: 0.25, color: 'error.main' }}
            >
              <Delete sx={{ fontSize: 12 }} />
            </IconButton>
          ))}
        </Box>
      )}

      {onColorChange && (
        <ColorPicker
          anchorEl={colorAnchor}
          open={Boolean(colorAnchor)}
          onClose={() => setColorAnchor(null)}
          currentColor={plan.color}
          onChange={(c) => onColorChange(plan, c)}
        />
      )}
    </Box>
  );
}

/**
 * Reusable column-per-day weekly grid.
 *
 * Props:
 * - columnData: { [dayNum]: Array<{ plan, items }> }
 * - dayTotals: { [day]: number }
 * - loading, editable
 * - onEntryClick(plan, dayItems), onDeleteItem(item), onColorChange(plan, color)
 * - onAddItem({ dayOfWeek })
 */
export default function WeekColumnGrid({
  columnData = {},
  dayTotals = {},
  loading = false,
  editable = true,
  onEntryClick,
  onDeleteItem,
  onColorChange,
  onAddItem,
}) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
        {DAY_LABELS.map((label, idx) => (
          <Box
            key={idx}
            sx={{
              flex: '1 0 0',
              minWidth: 150,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ bgcolor: 'action.hover', px: 1, py: 1, textAlign: 'center' }}>
              <Typography variant="caption" fontWeight={700}>{label}</Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              {[1, 2, 3].map(i => <Skeleton key={i} height={40} sx={{ mb: 0.5 }} />)}
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  const hasAnyData = Object.values(columnData).some(arr => arr.length > 0);
  if (!hasAnyData) {
    return <EmptyState message="No hay items planificados para esta semana" />;
  }

  const weekTotal = Object.values(dayTotals).reduce((sum, v) => sum + Number(v || 0), 0);

  return (
    <Box>
    <Box sx={{ display: 'flex', gap: 0.5, overflowX: 'auto', pb: 1 }}>
      {DAY_LABELS.map((label, idx) => {
        const dayNum = idx + 1;
        const entries = columnData[dayNum] || [];
        const total = dayTotals[String(dayNum)] ?? 0;

        return (
          <Box
            key={dayNum}
            sx={{
              flex: '1 0 0',
              minWidth: 150,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Column header */}
            <Box
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                px: 1,
                py: 0.75,
                textAlign: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.75rem' }}>
                {label}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                TIEMPO
              </Typography>
            </Box>

            {/* Column body — site rows */}
            <Box sx={{ flex: 1, p: 0.5, minHeight: 60 }}>
              {entries.map(({ plan, items }) => (
                <SiteRow
                  key={plan.plan_id}
                  plan={plan}
                  dayItems={items}
                  editable={editable}
                  onEntryClick={onEntryClick}
                  onDeleteItem={onDeleteItem}
                  onColorChange={onColorChange}
                />
              ))}
              {editable && onAddItem && (
                <Button
                  size="small"
                  startIcon={<Add sx={{ fontSize: 14 }} />}
                  onClick={() => onAddItem({ dayOfWeek: dayNum })}
                  sx={{
                    width: '100%',
                    mt: 0.5,
                    py: 0.5,
                    fontSize: '0.7rem',
                    textTransform: 'none',
                    color: 'text.secondary',
                    borderStyle: 'dashed',
                    '&:hover': { borderStyle: 'dashed', color: 'primary.main' },
                  }}
                  variant="outlined"
                >
                  Agregar
                </Button>
              )}
            </Box>

            {/* Column footer — daily total */}
            <Box
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                px: 1,
                py: 0.5,
                textAlign: 'center',
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ fontSize: '0.75rem' }}>
                {total > 0 ? `${total.toFixed(2)}h` : '—'}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>

    {/* Week total */}
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 1,
        mt: 1,
        px: 1,
      }}
    >
      <Typography variant="body2" fontWeight={700} color="text.secondary">
        Total semanal:
      </Typography>
      <Typography variant="body2" fontWeight={800} color="primary.main">
        {weekTotal > 0 ? `${weekTotal.toFixed(2)}h` : '—'}
      </Typography>
    </Box>
    </Box>
  );
}
