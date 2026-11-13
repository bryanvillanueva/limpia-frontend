// Helpers for the cleaner's "Ruta de hoy" (no UI here, so they can be tested and reused).

const MAPBOX = 'https://api.mapbox.com';

/** A place on the route: { label, address, lat?, lng? }. */
const hasCoords = (p) => Number.isFinite(p?.lat) && Number.isFinite(p?.lng);

/** What Google Maps receives for a place: its coordinates when known, otherwise the address. */
const googlePlace = (p) => (hasCoords(p) ? `${p.lat},${p.lng}` : p.address);

/**
 * Ordered stops of today's route.
 *  - With a start point (home or a typed address): start -> every site in the list order.
 *  - Without one: from the first site to the last one.
 *
 * @param {Array<{site_id:number, nombre:string, direccion?:string, lat?:number, lng?:number}>} sites
 * @param {{label:string, address:string}|null} start
 * @returns {Array<{key:string, label:string, address:string, lat?:number, lng?:number, kind:'start'|'site', number?:number}>}
 */
export function buildStops(sites = [], start = null) {
  const siteStops = sites.map((s, i) => ({
    key: `site-${s.site_id}`,
    kind: 'site',
    number: i + 1,
    label: s.nombre,
    address: s.direccion || s.nombre,
    lat: s.lat ?? undefined,
    lng: s.lng ?? undefined,
  }));
  if (!start?.address) return siteStops;
  return [{ key: 'start', kind: 'start', label: start.label, address: start.address }, ...siteStops];
}

/**
 * Google Maps directions link for the stops (origin, waypoints in order, destination). Opens the app on phones.
 * @returns {string|null} null when there is nothing to route.
 */
export function googleMapsUrl(stops) {
  if (!stops.length) return null;
  const params = new URLSearchParams({ api: '1', travelmode: 'driving' });
  if (stops.length === 1) {
    params.set('destination', googlePlace(stops[0]));
  } else {
    params.set('origin', googlePlace(stops[0]));
    params.set('destination', googlePlace(stops[stops.length - 1]));
    const middle = stops.slice(1, -1).map(googlePlace);
    if (middle.length) params.set('waypoints', middle.join('|'));
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

const geocodeCache = new Map();

/**
 * Coordinates of an address (Mapbox geocoding, biased to Australia). Cached for the session.
 * @returns {Promise<[number, number]|null>} [lng, lat] or null when not found.
 */
export async function geocode(address, token) {
  if (!address || !token) return null;
  const key = address.trim().toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key);
  const res = await fetch(
    `${MAPBOX}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?country=au&limit=1&access_token=${token}`,
  );
  if (!res.ok) throw new Error(`geocoding ${res.status}`);
  const data = await res.json();
  const center = data.features?.[0]?.center || null;
  geocodeCache.set(key, center);
  return center;
}

/**
 * Driving route through the points, in order (Mapbox Directions, up to 25 points).
 * @param {Array<[number, number]>} points - [lng, lat] pairs.
 * @returns {Promise<{geometry: object, distance: number, duration: number}|null>} meters / seconds.
 */
export async function drivingRoute(points, token) {
  if (!token || points.length < 2) return null;
  const path = points.slice(0, 25).map(([lng, lat]) => `${lng},${lat}`).join(';');
  const res = await fetch(
    `${MAPBOX}/directions/v5/mapbox/driving/${path}?geometries=geojson&overview=full&access_token=${token}`,
  );
  if (!res.ok) throw new Error(`directions ${res.status}`);
  const data = await res.json();
  const r = data.routes?.[0];
  return r ? { geometry: r.geometry, distance: r.distance, duration: r.duration } : null;
}

/** Moves one element of a list to another position (returns a new array). */
export function moveItem(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Today's sites in the order the user chose. A saved order only applies to the same day and the same
 * set of sites; anything else (new day, a site added or removed by the planner) falls back to the planner order.
 *
 * @param {Array<{site_id:number}>} sites - Planner order.
 * @param {{date:string, ids:number[]}|null} saved
 * @param {string} today - YYYY-MM-DD
 */
export function applySavedOrder(sites, saved, today) {
  if (!saved || saved.date !== today || !Array.isArray(saved.ids) || saved.ids.length !== sites.length) return sites;
  const byId = new Map(sites.map((s) => [s.site_id, s]));
  if (!saved.ids.every((id) => byId.has(id))) return sites;
  return saved.ids.map((id) => byId.get(id));
}

/** 12400 m -> "12.4 km"; 800 m -> "800 m" */
export const formatDistance = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1).replace(/\.0$/, '')} km` : `${Math.round(m)} m`);

/** 3900 s -> "1 h 5 min"; 1500 s -> "25 min" */
export function formatDuration(s) {
  const mins = Math.max(1, Math.round(s / 60));
  const h = Math.floor(mins / 60);
  return h ? `${h} h${mins % 60 ? ` ${mins % 60} min` : ''}` : `${mins} min`;
}
