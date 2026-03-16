import { useRef, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { LocationOff } from '@mui/icons-material';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * SiteMap - Interactive Mapbox GL JS map centered on a site's location.
 * Geocodes the address via Mapbox Geocoding v5 if lat/lng are not provided.
 * Pattern matches proven working Mapbox + React implementation.
 *
 * @param {string} address - Full address to geocode (fallback when no coordinates).
 * @param {number|null} lat - Latitude if available.
 * @param {number|null} lng - Longitude if available.
 * @param {number} height - Map container height in pixels.
 * @param {number} zoom - Initial zoom level.
 */
export default function SiteMap({ address, lat, lng, height = 380, zoom = 15 }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!mapboxgl.accessToken || mapboxgl.accessToken === 'YOUR_MAPBOX_TOKEN_HERE') {
      setError('token');
      return;
    }
    if (!address && !lat && !lng) {
      setError('no-address');
      return;
    }

    let cancelled = false;

    /**
     * Creates the map at given coordinates.
     */
    const initMap = (longitude, latitude) => {
      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      const marker = new mapboxgl.Marker({ color: '#26614f' })
        .setLngLat([longitude, latitude]);

      if (address) {
        const popup = new mapboxgl.Popup({ offset: 30, closeButton: false })
          .setText(address);
        marker.setPopup(popup);
        marker.addTo(map);
        popup.addTo(map);
      } else {
        marker.addTo(map);
      }

      mapRef.current = map;
    };

    /**
     * Geocodes the address then creates the map.
     */
    const geocodeAndInit = async () => {
      try {
        const encoded = encodeURIComponent(address);
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${mapboxgl.accessToken}&limit=1`
        );
        const data = await res.json();
        if (cancelled) return;

        if (data.features?.length > 0) {
          const [fLng, fLat] = data.features[0].center;
          initMap(fLng, fLat);
        } else {
          setError('not-found');
        }
      } catch {
        if (!cancelled) setError('fetch');
      }
    };

    if (lat && lng) {
      initMap(Number(lng), Number(lat));
    } else {
      geocodeAndInit();
    }

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [address, lat, lng, zoom]);

  if (error) {
    const messages = {
      token: 'Configura VITE_MAPBOX_TOKEN para ver el mapa',
      'no-address': 'Sin dirección disponible',
      'not-found': 'No se pudo encontrar la ubicación',
      fetch: 'Error al cargar el mapa',
    };
    return (
      <Box
        sx={{
          width: '100%',
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          borderRadius: 2,
        }}
      >
        <LocationOff color="disabled" sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          {messages[error]}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={mapContainerRef}
      sx={{ width: '100%', height, borderRadius: 2, overflow: 'hidden' }}
    />
  );
}
