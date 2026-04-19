/**
 * F-14: StartTripModal
 *
 * Opens when the driver taps "Start Trip" on an active ride.
 * - Shows a Leaflet map with the planned origin→destination route
 * - Lets driver optionally add intermediate waypoints by clicking the map
 * - On confirm: calls POST /api/carpool/routes/:id/start with the polyline
 * - Then begins GPS pinging every 10s via POST /api/carpool/routes/:id/location
 * - Driver can "End Trip" which calls PATCH /api/carpool/routes/:id/end-trip
 *
 * Props:
 *  - ride        — CarpoolRoute object (needs origin, destination, _id)
 *  - onClose     — fn() called when modal is dismissed
 *  - onTripStart — fn(stopPingFn) called after trip starts; receives a cleanup fn
 *  - onTripEnd   — fn() called after trip ends
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import { Navigation, X, Play, Square, AlertTriangle, MapPin, Info } from "lucide-react";
import L from "leaflet";
import api from "../lib/api";
import { toast } from "sonner";

// Fix Leaflet default icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const originIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const destIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const waypointIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
});

const PING_INTERVAL_MS = 10_000; // 10 seconds

// ── Map click handler sub-component ──────────────────────────────────────────
function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function StartTripModal({ ride, onClose, onTripStart, onTripEnd }) {
  const [waypoints, setWaypoints] = useState([]); // extra points clicked by driver
  const [tripActive, setTripActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ending, setEnding] = useState(false);
  const pingIntervalRef = useRef(null);
  const watchIdRef = useRef(null);
  const latestPositionRef = useRef(null);

  const origin = { lat: ride.origin.lat, lng: ride.origin.lng };
  const dest = { lat: ride.destination.lat, lng: ride.destination.lng };

  // Build the full polyline: origin + waypoints + destination
  const fullPolyline = [origin, ...waypoints, dest];

  // Center the map between origin and destination
  const centerLat = (origin.lat + dest.lat) / 2;
  const centerLng = (origin.lng + dest.lng) / 2;

  const handleMapClick = useCallback((latlng) => {
    if (tripActive) return; // Don't allow changes once trip started
    setWaypoints((prev) => [...prev, { lat: latlng.lat, lng: latlng.lng }]);
  }, [tripActive]);

  const removeLastWaypoint = () => {
    setWaypoints((prev) => prev.slice(0, -1));
  };

  // ── Start GPS watching ───────────────────────────────────────────────────
  const startGpsWatch = useCallback(() => {
    if (!navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        latestPositionRef.current = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
      },
      (err) => console.warn("GPS watch error:", err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }, []);

  // ── Ping backend with current position ───────────────────────────────────
  const pingPosition = useCallback(async () => {
    if (!latestPositionRef.current) {
      // Fallback: one-shot getCurrentPosition
      navigator.geolocation?.getCurrentPosition(
        async (pos) => {
          latestPositionRef.current = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          await sendPing(latestPositionRef.current);
        },
        () => {}
      );
      return;
    }
    await sendPing(latestPositionRef.current);
  }, [ride._id]);

  const sendPing = async (position) => {
    try {
      await api.post(`/carpool/routes/${ride._id}/location`, position);
    } catch (err) {
      console.warn("Location ping failed:", err.message);
    }
  };

  // ── Start Trip ───────────────────────────────────────────────────────────
  const handleStartTrip = async () => {
    if (!navigator.geolocation) {
      toast.error("GPS is not available on this device.");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/carpool/routes/${ride._id}/start`, {
        polyline: fullPolyline,
      });

      setTripActive(true);
      startGpsWatch();

      // Begin periodic pings immediately
      await pingPosition();
      pingIntervalRef.current = setInterval(pingPosition, PING_INTERVAL_MS);

      toast.success("Trip started! Passengers can now see route tracking.");
      onTripStart(() => stopPinging);
    } catch (err) {
      toast.error(err.message || "Failed to start trip.");
    } finally {
      setLoading(false);
    }
  };

  // ── Stop all pinging ──────────────────────────────────────────────────────
  const stopPinging = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (watchIdRef.current != null) {
      navigator.geolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  // ── End Trip ─────────────────────────────────────────────────────────────
  const handleEndTrip = async () => {
    setEnding(true);
    stopPinging();
    try {
      await api.patch(`/carpool/routes/${ride._id}/end-trip`);
      toast.success("Trip ended. Ride marked as completed.");
      onTripEnd?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to end trip.");
    } finally {
      setEnding(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopPinging();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
              <Navigation size={16} className="text-teal-600" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900 text-sm">
                {tripActive ? "Trip in Progress" : "Start Your Trip"}
              </h2>
              <p className="text-xs text-stone-500">
                {ride.origin.area} → {ride.destination.area}
              </p>
            </div>
          </div>
          {!tripActive && (
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Info banner */}
        {!tripActive && (
          <div className="mx-4 mt-4 flex items-start gap-2 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2.5">
            <Info size={14} className="text-sky-600 shrink-0 mt-0.5" />
            <p className="text-xs text-sky-800 leading-relaxed">
              <strong>Optional:</strong> Click the map to add waypoints along your route. This improves deviation detection accuracy. Then tap <strong>Start Trip</strong> when ready.
            </p>
          </div>
        )}

        {/* Map */}
        <div className="flex-1 min-h-0 mx-4 mt-3 rounded-xl overflow-hidden border border-stone-200" style={{ height: "280px" }}>
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            {!tripActive && <MapClickHandler onMapClick={handleMapClick} />}

            {/* Origin marker */}
            <Marker position={[origin.lat, origin.lng]} icon={originIcon} />

            {/* Destination marker */}
            <Marker position={[dest.lat, dest.lng]} icon={destIcon} />

            {/* Waypoint markers */}
            {waypoints.map((wp, i) => (
              <Marker key={i} position={[wp.lat, wp.lng]} icon={waypointIcon} />
            ))}

            {/* Route polyline */}
            <Polyline
              positions={fullPolyline.map((p) => [p.lat, p.lng])}
              color={tripActive ? "#0d9488" : "#6366f1"}
              weight={3}
              dashArray={tripActive ? undefined : "6 4"}
            />
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 pt-2 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            Origin
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            Destination
          </span>
          {waypoints.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
              {waypoints.length} waypoint{waypoints.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-4 space-y-3">
          {!tripActive ? (
            <>
              {waypoints.length > 0 && (
                <button
                  onClick={removeLastWaypoint}
                  className="w-full text-xs text-stone-500 hover:text-stone-700 flex items-center justify-center gap-1 py-1.5"
                >
                  <MapPin size={12} />
                  Remove last waypoint
                </button>
              )}
              <button
                onClick={handleStartTrip}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play size={16} />
                )}
                {loading ? "Starting trip…" : "Start Trip & Begin Tracking"}
              </button>
            </>
          ) : (
            <>
              {/* Active trip status */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-teal-50 border border-teal-200">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
                </span>
                <p className="text-sm text-teal-800">
                  <strong>Tracking active.</strong> Your location is being
                  shared with passengers every 10 seconds.
                </p>
              </div>

              {/* Deviation warning reminder */}
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  If you deviate more than 500m from the planned route,
                  passengers will be alerted automatically.
                </p>
              </div>

              <button
                onClick={handleEndTrip}
                disabled={ending}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {ending ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Square size={16} />
                )}
                {ending ? "Ending trip…" : "End Trip"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
