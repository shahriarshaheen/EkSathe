import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const pickupIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dropoffIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Reverse geocode using Nominatim (free, no API key)
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
      { headers: { "Accept-Language": "en" } },
    );
    const data = await res.json();
    const addr = data.address || {};
    const name =
      [
        addr.road || addr.pedestrian || addr.footway,
        addr.suburb || addr.neighbourhood || addr.quarter,
      ]
        .filter(Boolean)
        .join(", ") ||
      data.display_name?.split(",")[0] ||
      "Selected location";

    const area =
      addr.suburb ||
      addr.neighbourhood ||
      addr.quarter ||
      addr.city_district ||
      addr.county ||
      "Dhaka";

    return { name, area, lat, lng };
  } catch {
    return {
      name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      area: "Dhaka",
      lat,
      lng,
    };
  }
};

// Inner component — handles map click events
const ClickHandler = ({ onPickup, onDropoff, pickupSet, dropoffSet }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const location = await reverseGeocode(lat, lng);
      if (!pickupSet) {
        onPickup(location);
      } else if (!dropoffSet) {
        onDropoff(location);
      }
    },
  });
  return null;
};

// Props:
//   pickup   = { name, area, lat, lng } | null
//   dropoff  = { name, area, lat, lng } | null
//   onPickup(location)  — called when pickup is set
//   onDropoff(location) — called when dropoff is set
//   onReset()           — called when user resets markers
//   presetOrigin        — { lat, lng } to fly to (for preset routes)
//   presetDestination   — { lat, lng } to fly to (for preset routes)

export default function CarpoolMapPicker({
  pickup,
  dropoff,
  onPickup,
  onDropoff,
  onReset,
  presetOrigin,
  presetDestination,
  readOnly = false,
}) {
  const mapRef = useRef(null);
  const [geocoding, setGeocoding] = useState(false);

  // When preset route is selected, fly map to show both points
  useEffect(() => {
    if (!mapRef.current) return;
    if (presetOrigin && presetDestination) {
      const bounds = L.latLngBounds(
        [presetOrigin.lat, presetOrigin.lng],
        [presetDestination.lat, presetDestination.lng],
      );
      mapRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
    }
  }, [presetOrigin, presetDestination]);

  const handlePickup = async (location) => {
    setGeocoding(true);
    onPickup(location);
    setGeocoding(false);
  };

  const handleDropoff = async (location) => {
    setGeocoding(true);
    onDropoff(location);
    setGeocoding(false);
  };

  const pickupSet = !!pickup;
  const dropoffSet = !!dropoff;
  const bothSet = pickupSet && dropoffSet;

  // Instruction text
  const instruction = readOnly
    ? null
    : !pickupSet
      ? "Tap the map to set your pickup point"
      : !dropoffSet
        ? "Now tap to set your drop-off point"
        : "Both points set — tap Reset to change";

  const instructionColor = !pickupSet
    ? "bg-teal-50 border-teal-200 text-teal-700"
    : !dropoffSet
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-green-50 border-green-200 text-green-700";

  // Draw line between pickup and dropoff
  const polyline = bothSet
    ? [
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng],
      ]
    : null;

  return (
    <div className="flex flex-col gap-3">
      {/* Instruction banner */}
      {!readOnly && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-xs font-semibold ${instructionColor}`}
        >
          <span>{instruction}</span>
          {(pickupSet || dropoffSet) && (
            <button
              type="button"
              onClick={onReset}
              className="text-xs font-bold underline opacity-70 hover:opacity-100 flex-shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Geocoding indicator */}
      {geocoding && (
        <div className="flex items-center gap-2 text-xs text-stone-400 px-1">
          <div className="w-3 h-3 border border-teal-500 border-t-transparent rounded-full animate-spin" />
          Getting address...
        </div>
      )}

      {/* Map */}
      <div
        className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm"
        style={{ height: 300 }}
      >
        <MapContainer
          center={[23.8103, 90.4125]}
          zoom={12}
          className="w-full h-full"
          ref={mapRef}
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {!readOnly && (
            <ClickHandler
              onPickup={handlePickup}
              onDropoff={handleDropoff}
              pickupSet={pickupSet}
              dropoffSet={dropoffSet}
            />
          )}

          {pickup && (
            <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />
          )}
          {dropoff && (
            <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffIcon} />
          )}
          {polyline && (
            <Polyline
              positions={polyline}
              pathOptions={{
                color: "#0d9488",
                weight: 3,
                dashArray: "8 6",
                opacity: 0.8,
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Selected points summary */}
      {(pickupSet || dropoffSet) && (
        <div className="flex flex-col gap-2">
          {pickupSet && (
            <div className="flex items-start gap-2.5 bg-white rounded-xl border border-stone-200 px-3 py-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-100 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Pickup
                </p>
                <p className="text-sm font-semibold text-stone-800 truncate">
                  {pickup.name}
                </p>
                <p className="text-xs text-stone-400">{pickup.area}</p>
              </div>
            </div>
          )}
          {dropoffSet && (
            <div className="flex items-start gap-2.5 bg-white rounded-xl border border-stone-200 px-3 py-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Drop-off
                </p>
                <p className="text-sm font-semibold text-stone-800 truncate">
                  {dropoff.name}
                </p>
                <p className="text-xs text-stone-400">{dropoff.area}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
