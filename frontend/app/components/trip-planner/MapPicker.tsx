"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

// This module is only ever reached through dynamic(() => import("./MapPicker"),
// { ssr: false }) from PlanForm, so `import L from "leaflet"` never runs on the
// server. Leaflet's own CSS is loaded as an external <link> in app/plan/page.tsx
// (Turbopack's CSS parser chokes on leaflet.css's legacy IE `progid` filter).

export type LatLng = { lat: number; lng: number };

// Custom pin — Leaflet's default marker PNGs 404 under bundlers.
const pinIcon = L.divIcon({
  className: "",
  html:
    '<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" ' +
    'fill="#059669" stroke="#ffffff" stroke-width="1.5">' +
    '<path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z"/>' +
    '<circle cx="12" cy="10" r="2.6" fill="#ffffff"/></svg>',
  iconSize: [30, 30],
  iconAnchor: [15, 28],
});

function ClickCapture({ onPick }: { onPick: (c: LatLng) => void }) {
  useMapEvents({
    click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

function Recenter({ value }: { value: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (value) {
      map.flyTo([value.lat, value.lng], Math.max(map.getZoom(), 11), { duration: 0.8 });
    }
    // only react to coordinate identity, not the `map` instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);
  return null;
}

type MapPickerProps = {
  value: LatLng | null;
  onPick: (c: LatLng) => void;
};

export default function MapPicker({ value, onPick }: MapPickerProps) {
  return (
    <MapContainer
      center={[-2.5, 118]}
      zoom={4}
      scrollWheelZoom
      className="h-[300px] w-full rounded-xl border border-zinc-200 dark:border-zinc-800 lg:h-full lg:min-h-[420px]"
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      <ClickCapture onPick={onPick} />
      <Recenter value={value} />
      {value && <Marker position={[value.lat, value.lng]} icon={pinIcon} />}
    </MapContainer>
  );
}
