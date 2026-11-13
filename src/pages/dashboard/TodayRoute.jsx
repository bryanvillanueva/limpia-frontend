import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box, Paper, Typography, Button, ToggleButton, ToggleButtonGroup, TextField,
  CircularProgress, Alert, InputAdornment, IconButton, useTheme,
} from '@mui/material';
import { Home, Flag, EditLocationAlt, Map as MapIcon, Directions, Check, Route, RestartAlt } from '@mui/icons-material';
import StopList from './StopList';
import mapboxgl from 'mapbox-gl';
import { useNavigate } from 'react-router-dom';
import { buildStops, googleMapsUrl, geocode, drivingRoute, formatDistance, formatDuration } from './route';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const HAS_TOKEN = Boolean(TOKEN) && TOKEN !== 'YOUR_MAPBOX_TOKEN_HERE';
const STORAGE_KEY = 'limpia_route_start';
const TOGGLE_SX = { flex: 1, gap: 0.75, textTransform: 'none', whiteSpace: 'nowrap', px: { xs: 0.75, sm: 1.5 }, '& svg': { display: { xs: 'none', sm: 'block' } } };

const readSaved = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
};
const save = (v) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(v)); } catch { /* storage unavailable */ } };

/** Numbered pin for the map (the start point gets a house). */
function markerEl(stop, color) {
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  Object.assign(el.style, {
    width: '28px', height: '28px', borderRadius: '50%', background: color, color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    font: '700 13px Montserrat, sans-serif', border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,.35)',
  });
  el.textContent = stop.kind === 'start' ? '⌂' : String(stop.number);
  return el;
}

const pinColor = (stop, isLast, palette) => {
  if (stop.kind === 'start') return palette.grey[800];
  return isLast ? palette.error.main : palette.primary.main;
};

/**
 * Today's route for a cleaner: where it starts (home, first site or a typed address),
 * the map with the driving route through today's sites in order, and a Google Maps link.
 *
 * @param {Array}    sites          - Today's sites ({ site_id, nombre, direccion, lat, lng }), in visiting order.
 * @param {string}   [homeAddress]  - The user's address from their profile, if any.
 * @param {Function} onMove         - (from, to) reorders the sites.
 * @param {Function} [onResetOrder] - Back to the planner order.
 * @param {boolean}  [customOrder]  - The user changed the planner order.
 */
export default function TodayRoute({ sites, homeAddress, onMove, onResetOrder, customOrder = false }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const saved = useMemo(readSaved, []);

  // Start point: home when the profile has an address, otherwise the first site. Remembered per browser.
  const [mode, setMode] = useState(() => {
    if (saved.mode === 'custom' && saved.custom) return 'custom';
    if (saved.mode === 'first') return 'first';
    return homeAddress ? 'home' : 'first';
  });
  const [custom, setCustom] = useState(saved.custom || '');
  const [draft, setDraft] = useState(saved.custom || '');
  const effectiveMode = mode === 'home' && !homeAddress ? 'first' : mode;

  const start = useMemo(() => {
    if (effectiveMode === 'home') return { kind: 'home', label: 'Mi casa', address: homeAddress };
    if (effectiveMode === 'custom' && custom) return { kind: 'custom', label: 'Partida', address: custom };
    return null;
  }, [effectiveMode, homeAddress, custom]);

  const stops = useMemo(() => buildStops(sites, start), [sites, start]);
  const mapsUrl = googleMapsUrl(stops);

  const changeMode = (_, value) => {
    if (!value) return;
    setMode(value);
    save({ mode: value, custom });
  };
  const applyCustom = () => {
    const v = draft.trim();
    setCustom(v);
    save({ mode: 'custom', custom: v });
  };

  // ── Map + route ──
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [routeInfo, setRouteInfo] = useState(null); // { distance, duration }
  const [missing, setMissing] = useState([]); // stops we could not place on the map
  const [loading, setLoading] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!HAS_TOKEN || !mapEl.current || mapRef.current) return undefined;
    try {
      mapboxgl.accessToken = TOKEN;
      mapRef.current = new mapboxgl.Map({
        container: mapEl.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [144.96, -37.81], // Melbourne
        zoom: 10,
        attributionControl: false,
      });
      mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    } catch {
      setMapError(true);
    }
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!HAS_TOKEN || stops.length === 0) return undefined;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const coords = await Promise.all(stops.map(async (s) => {
          if (Number.isFinite(s.lat) && Number.isFinite(s.lng)) return [s.lng, s.lat];
          try { return await geocode(s.address, TOKEN); } catch { return null; }
        }));
        if (cancelled) return;
        const located = stops.map((s, i) => ({ stop: s, at: coords[i] })).filter((x) => x.at);
        setMissing(stops.filter((_, i) => !coords[i]).map((s) => s.label));

        let route = null;
        try { route = await drivingRoute(located.map((x) => x.at), TOKEN); } catch { route = null; }
        if (cancelled) return;
        setRouteInfo(route ? { distance: route.distance, duration: route.duration } : null);

        const map = mapRef.current;
        if (!map) return;
        const draw = () => {
          markersRef.current.forEach((m) => m.remove());
          const lastSite = stops[stops.length - 1];
          markersRef.current = located.map(({ stop, at }) =>
            new mapboxgl.Marker({ element: markerEl(stop, pinColor(stop, stop === lastSite, theme.palette)) })
              .setLngLat(at)
              .setPopup(new mapboxgl.Popup({ offset: 18, closeButton: false }).setText(stop.label))
              .addTo(map));

          const data = route ? { type: 'Feature', geometry: route.geometry, properties: {} } : { type: 'FeatureCollection', features: [] };
          if (map.getSource('route')) map.getSource('route').setData(data);
          else {
            map.addSource('route', { type: 'geojson', data });
            map.addLayer({
              id: 'route', type: 'line', source: 'route',
              layout: { 'line-join': 'round', 'line-cap': 'round' },
              paint: { 'line-color': theme.palette.primary.main, 'line-width': 4, 'line-opacity': 0.85 },
            });
          }

          if (located.length) {
            const bounds = new mapboxgl.LngLatBounds();
            located.forEach(({ at }) => bounds.extend(at));
            map.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 0 });
          }
        };
        if (map.isStyleLoaded()) draw(); else map.once('load', draw);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [stops, theme.palette]);

  if (!sites.length) {
    return (
      <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', height: '100%' }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Ruta de hoy</Typography>
        <Typography variant="body2" color="text.secondary">No hay sitios planificados hoy, así que no hay ruta.</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header + route summary */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, pt: 2, pb: 1.5, flexWrap: 'wrap' }}>
        <Route sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>Ruta de hoy</Typography>
        {loading && <CircularProgress size={16} aria-label="Calculando ruta" />}
        {routeInfo && (
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {formatDistance(routeInfo.distance)} · {formatDuration(routeInfo.duration)} en auto
          </Typography>
        )}
      </Box>

      {/* Start point */}
      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.75 }}>Punto de partida</Typography>
        <ToggleButtonGroup exclusive size="small" value={effectiveMode} onChange={changeMode} fullWidth aria-label="Punto de partida">
          {/* Without an address in the profile this stays disabled; the link below explains how to add it */}
          <ToggleButton value="home" disabled={!homeAddress} title={homeAddress || undefined} sx={TOGGLE_SX}>
            <Home fontSize="small" /> Mi casa
          </ToggleButton>
          <ToggleButton value="first" sx={TOGGLE_SX}>
            <Flag fontSize="small" /> Primer sitio
          </ToggleButton>
          <ToggleButton value="custom" sx={TOGGLE_SX}>
            <EditLocationAlt fontSize="small" /> Otra
          </ToggleButton>
        </ToggleButtonGroup>

        {effectiveMode === 'custom' && (
          <TextField
            fullWidth
            size="small"
            sx={{ mt: 1.25 }}
            label="Dirección de partida"
            placeholder="Ej: 12 Smith St, Fitzroy"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyCustom(); }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" aria-label="Usar esta dirección" onClick={applyCustom} disabled={!draft.trim() || draft.trim() === custom}>
                      <Check fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
        {!homeAddress && (
          <Button size="small" onClick={() => navigate('/perfil')} sx={{ mt: 0.75, px: 0.5, textTransform: 'none' }}>
            Agregar mi dirección de casa
          </Button>
        )}
      </Box>

      {/* Stops, reorderable like in Google Maps */}
      <Box sx={{ px: 2.5, pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75, minHeight: 28 }}>
          <Typography variant="caption" color="text.secondary">
            Paradas
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}> · arrastra para cambiar el orden</Box>
          </Typography>
          {customOrder && onResetOrder && (
            <Button size="small" startIcon={<RestartAlt />} onClick={onResetOrder} sx={{ textTransform: 'none', py: 0, whiteSpace: 'nowrap' }}>
              Orden del planner
            </Button>
          )}
        </Box>
        <StopList start={start} sites={sites} onMove={onMove} />
      </Box>

      {/* Map */}
      {HAS_TOKEN && !mapError ? (
        <Box ref={mapEl} role="img" aria-label="Mapa de la ruta de hoy" sx={{ height: { xs: 220, md: 240 }, bgcolor: 'action.hover', flexShrink: 0 }} />
      ) : (
        <Box sx={{ mx: 2.5, p: 2, borderRadius: '10px', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <MapIcon fontSize="small" />
          <Typography variant="body2">El mapa no está disponible; puedes abrir la ruta en Google Maps.</Typography>
        </Box>
      )}

      {missing.length > 0 && (
        <Alert severity="info" sx={{ mx: 2.5, mt: 1.5, py: 0 }}>
          No pudimos ubicar en el mapa: {missing.join(', ')}. Google Maps la buscará por dirección.
        </Alert>
      )}

      {/* Open in Maps, with the same stops and order */}
      <Box sx={{ px: 2.5, py: 2, mt: 'auto' }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Directions />}
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir en Google Maps
        </Button>
      </Box>
    </Paper>
  );
}
