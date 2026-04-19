/**
 * F-14: DeviationAlertBanner
 *
 * Polls the backend every 10 seconds to check for route deviation alerts.
 * Renders a prominent amber warning banner when an active deviation is detected.
 *
 * Props:
 *  - rideId        (string)  — the carpool route ID to poll
 *  - isDriver      (bool)    — drivers see a different message (their own deviation)
 *  - tripActive    (bool)    — only poll when trip is active
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { AlertTriangle, X, Navigation, ExternalLink } from "lucide-react";
import api from "../lib/api";

const POLL_INTERVAL_MS = 10_000; // 10 seconds

export default function DeviationAlertBanner({ rideId, isDriver }) {
  const [alert, setAlert] = useState(null);
  const [tripActive, setTripActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef(null);

  const fetchAlerts = useCallback(async () => {
    try {
      const { data } = await api.get(
        `/carpool/routes/${rideId}/deviation-alerts`
      );
      setTripActive(data.tripActive);

      if (data.alert) {
        setAlert(data.alert);
        setVisible(true);
      } else {
        // If there's no active alert, hide (driver may have returned to route)
        setAlert((prev) => {
          if (prev) setVisible(false);
          return null;
        });
      }
    } catch {
      // Silently fail — don't break the UI
    }
  }, [rideId]);

  // Start / stop polling based on tripActive
  useEffect(() => {
    if (!rideId) return;

    // Initial fetch
    fetchAlerts();

    // Poll every 10 seconds
    intervalRef.current = setInterval(fetchAlerts, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [rideId, fetchAlerts]);

  const handleDismiss = async () => {
    if (!alert) return;
    setVisible(false);
    try {
      await api.post(
        `/carpool/routes/${rideId}/deviation-alerts/${alert._id}/ack`
      );
    } catch {
      // ignore
    }
  };

  const mapsLink = alert
    ? `https://maps.google.com/?q=${alert.deviationLat},${alert.deviationLng}`
    : "#";

  // Don't render if trip hasn't started or no alert
  if (!tripActive && !alert) return null;
  if (!visible || !alert) {
    // Show a subtle "Trip active" indicator when no deviation
    if (tripActive && !isDriver) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </span>
          Trip is active — route is on track
        </div>
      );
    }
    if (tripActive && isDriver) {
      return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 text-sm">
          <Navigation size={14} className="shrink-0" />
          Tracking active — sharing location with passengers
        </div>
      );
    }
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 overflow-hidden shadow-sm">
      {/* Header strip */}
      <div className="flex items-center justify-between gap-2 bg-amber-400 px-4 py-2">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-white shrink-0" />
          <span className="text-white font-semibold text-sm tracking-wide">
            Route Deviation Detected
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <p className="text-amber-900 text-sm leading-relaxed">
          {isDriver ? (
            <>
              You are currently{" "}
              <strong>{alert.distanceMetres}m away</strong> from the planned
              route. Your passengers have been notified.
            </>
          ) : (
            <>
              Your driver is{" "}
              <strong>{alert.distanceMetres}m away</strong> from the
              planned route. Please stay alert. If you feel unsafe, use the{" "}
              <strong>SOS button</strong>.
            </>
          )}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ExternalLink size={12} />
            View location on map
          </a>
          <button
            onClick={handleDismiss}
            className="text-xs text-amber-700 hover:text-amber-900 underline transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
