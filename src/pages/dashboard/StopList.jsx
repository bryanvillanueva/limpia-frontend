import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Tooltip, alpha } from '@mui/material';
import { DragIndicator, Home, EditLocationAlt } from '@mui/icons-material';

/** Vertical dotted line between two stops, like Google Maps. */
const Connector = () => (
  <Box aria-hidden sx={{ display: 'flex', pl: '35px', height: 10 }}>
    <Box sx={{ borderLeft: '2px dotted', borderColor: 'text.disabled' }} />
  </Box>
);

const markerSx = {
  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
};

const placeBoxSx = {
  flex: 1, minWidth: 0, px: 1.5, py: 0.9, borderRadius: '10px',
  border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
};

/**
 * Today's stops, reorderable like in Google Maps.
 *  - Drag a site by its handle (mouse or finger: pointer events, no extra library).
 *  - Keyboard: focus the handle and use ↑ / ↓.
 * The start point (home / typed address) stays first and is changed with the toggle above, not here.
 *
 * @param {{label:string, address:string, kind:'home'|'custom'}|null} start
 * @param {Array<{site_id:number, nombre:string}>} sites - In visiting order.
 * @param {Function} onMove - (fromIndex, toIndex) => void
 */
export default function StopList({ start, sites, onMove }) {
  const rowRefs = useRef([]);
  const handleRefs = useRef([]);
  const drag = useRef(null); // { index, startY, rects, over }
  const [dragging, setDragging] = useState(null); // { index, dy, over, h: dragged row height }
  const [announce, setAnnounce] = useState('');
  const focusAfterMove = useRef(null);

  // Keep keyboard focus on the moved stop
  useEffect(() => {
    if (focusAfterMove.current != null) {
      handleRefs.current[focusAfterMove.current]?.focus();
      focusAfterMove.current = null;
    }
  }, [sites]);

  const move = (from, to, viaKeyboard = false) => {
    if (to < 0 || to >= sites.length || from === to) return;
    if (viaKeyboard) focusAfterMove.current = to;
    setAnnounce(`${sites[from].nombre}: parada ${to + 1} de ${sites.length}`);
    onMove(from, to);
  };

  const onPointerDown = (e, index) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* keep dragging without capture */ }
    drag.current = {
      index,
      startY: e.clientY,
      rects: rowRefs.current.slice(0, sites.length).map((el) => el?.getBoundingClientRect()),
    };
    setDragging({ index, dy: 0, over: index, h: drag.current.rects[index]?.height ?? 0 });
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dy = e.clientY - d.startY;
    const own = d.rects[d.index];
    const center = own ? own.top + own.height / 2 + dy : e.clientY;
    // Target slot: how many other rows have their middle above the dragged row's middle
    let over = 0;
    d.rects.forEach((r, i) => { if (i !== d.index && r && r.top + r.height / 2 < center) over += 1; });
    d.over = over; // read on drop: state may not have rendered yet on a fast release
    setDragging((prev) => ({ ...prev, dy, over }));
  };

  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    if (d) move(d.index, d.over ?? d.index);
    setDragging(null);
  };

  const onKeyDown = (e, index) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); move(index, index - 1, true); }
    if (e.key === 'ArrowDown') { e.preventDefault(); move(index, index + 1, true); }
  };

  // While dragging, rows between the old and new slot slide one row to make room
  const shiftFor = (i) => {
    if (!dragging || i === dragging.index) return 0;
    const { h } = dragging;
    const gap = 10; // connector height
    const { index: from, over: to } = dragging;
    if (from < to && i > from && i <= to) return -(h + gap);
    if (from > to && i >= to && i < from) return h + gap;
    return 0;
  };

  return (
    <Box>
      <Box role="status" aria-live="polite" sx={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        {announce}
      </Box>

      {start && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 22 }} />
            <Box sx={{ ...markerSx, bgcolor: 'grey.800', color: 'common.white' }}>
              {start.kind === 'home' ? <Home sx={{ fontSize: 15 }} /> : <EditLocationAlt sx={{ fontSize: 15 }} />}
            </Box>
            <Box sx={placeBoxSx}>
              <Typography variant="body2" noWrap title={start.address}>
                <Box component="span" sx={{ fontWeight: 600 }}>{start.label}</Box>
                <Box component="span" sx={{ color: 'text.secondary' }}> ({start.address})</Box>
              </Typography>
            </Box>
          </Box>
          <Connector />
        </>
      )}

      <Box component="ol" aria-label="Orden de las paradas" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {sites.map((site, i) => {
          const isLast = i === sites.length - 1;
          const isDragged = dragging?.index === i;
          const transform = isDragged ? `translateY(${dragging.dy}px)` : `translateY(${shiftFor(i)}px)`;
          return (
            <Box component="li" key={site.site_id}>
              <Box
                ref={(el) => { rowRefs.current[i] = el; }}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  position: 'relative', zIndex: isDragged ? 2 : 1,
                  transform,
                  transition: isDragged ? 'none' : 'transform 0.15s ease',
                }}
              >
                <Tooltip title="Arrastra para cambiar el orden (o usa ↑ ↓)" placement="left" disableInteractive>
                  <Box
                    ref={(el) => { handleRefs.current[i] = el; }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Mover ${site.nombre}, parada ${i + 1} de ${sites.length}. Usa las flechas arriba y abajo`}
                    aria-roledescription="elemento reordenable"
                    onPointerDown={(e) => onPointerDown(e, i)}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    sx={{
                      width: 22, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'text.disabled', cursor: isDragged ? 'grabbing' : 'grab', borderRadius: '6px',
                      touchAction: 'none', userSelect: 'none', flexShrink: 0,
                      '&:hover': { color: 'text.secondary', bgcolor: 'action.hover' },
                      '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', color: 'primary.main' },
                    }}
                  >
                    <DragIndicator fontSize="small" />
                  </Box>
                </Tooltip>

                {/* Same numbers as the map pins; the destination is red */}
                <Box sx={{ ...markerSx, bgcolor: isLast ? 'error.main' : 'primary.main', color: 'common.white' }}>{i + 1}</Box>

                <Box
                  sx={{
                    ...placeBoxSx,
                    ...(isDragged && {
                      borderColor: 'primary.main',
                      boxShadow: (t) => `0 6px 18px ${alpha(t.palette.common.black, 0.18)}`,
                    }),
                  }}
                >
                  <Typography variant="body2" noWrap title={site.nombre}>
                    {site.nombre}
                    {isLast && <Box component="span" sx={{ color: 'text.secondary' }}> · destino</Box>}
                  </Typography>
                </Box>
              </Box>
              {!isLast && <Connector />}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
