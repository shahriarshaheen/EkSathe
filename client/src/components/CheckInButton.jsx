// client/src/components/CheckInButton.jsx

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Clock, AlertCircle, Loader2, Users } from "lucide-react";
import api from "../lib/api";

// ── helpers ───────────────────────────────────────────────────────────────────
const getCurrentLocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 0,
      },
    );
  });
const pad = (n) => String(n).padStart(2, "0");

const formatCountdown = (ms) => {
  if (ms <= 0) return "00:00";
  const totalSecs = Math.floor(ms / 1000);
  const mins      = Math.floor(totalSecs / 60);
  const secs      = totalSecs % 60;
  return `${pad(mins)}:${pad(secs)}`;
};

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" });

// ── PassengerCheckinRow ───────────────────────────────────────────────────────

const PassengerCheckinRow = ({ p }) => (
  <div className="flex items-center gap-2.5 py-2 border-b border-stone-50 last:border-0">
    <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
      {p.photoUrl ? (
        <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs font-bold text-teal-600">
          {p.name?.[0]?.toUpperCase() ?? "?"}
        </span>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-stone-700 truncate">{p.name}</p>
      {p.checkedIn && p.checkedInAt && (
        <p className="text-xs text-stone-400">Checked in at {formatTime(p.checkedInAt)}</p>
      )}
    </div>
    {p.checkedIn ? (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
        <CheckCircle size={11} className="fill-teal-100" /> In
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-xs font-bold text-stone-400 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-full">
        <Clock size={11} /> Waiting
      </span>
    )}
  </div>
);

// ── main component ────────────────────────────────────────────────────────────

const CheckInButton = ({ ride, isDriver }) => {
  const [status,       setStatus]       = useState(null);   // checkin-status response
  const [loading,      setLoading]      = useState(true);
  const [checkingIn,   setCheckingIn]   = useState(false);
  const [cancelling,   setCancelling]   = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");
  const [countdown,    setCountdown]    = useState("");
  const [showPanel,    setShowPanel]    = useState(false);  // driver's passenger panel
  const [noShowResult, setNoShowResult] = useState(null);

  const rideId = ride._id;

  // ── fetch checkin status ──────────────────────────────────────────────────

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await api.get(`/carpool/${rideId}/checkin-status`);
      if (data.success) setStatus(data.data);
    } catch {
      // silently fail — checkin is a non-critical enhancement
    } finally {
      setLoading(false);
    }
  }, [rideId]);

  useEffect(() => {
    fetchStatus();
    // Poll every 30 seconds so driver sees live updates
    const poll = setInterval(fetchStatus, 30000);
    return () => clearInterval(poll);
  }, [fetchStatus]);

  // ── live countdown timer ──────────────────────────────────────────────────

  useEffect(() => {
    if (!status) return;

    const tick = () => {
      const now  = new Date();
      if (status.windowStatus === "upcoming") {
        const msUntil = new Date(status.windowOpen) - now;
        if (msUntil <= 0) {
          fetchStatus(); // re-fetch when window opens
        } else {
          setCountdown(formatCountdown(msUntil));
        }
      } else if (status.windowStatus === "open") {
        const msLeft = new Date(status.windowClose) - now;
        if (msLeft <= 0) {
          fetchStatus();
        } else {
          setCountdown(formatCountdown(msLeft));
        }
      } else {
        setCountdown("");
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [status, fetchStatus]);

  // ── check in (passenger) ──────────────────────────────────────────────────

  const handleCheckin = async () => {
    setCheckingIn(true);
    setError("");
    try {
      const location = await getCurrentLocation();

      const res = await api.post(
        `/carpool/${rideId}/checkin`,
        location
          ? {
              lat: location.lat,
              lng: location.lng,
            }
          : {},
      );
      const reward = res.data?.reward;

      if (reward?.coinsEarned > 0) {
        setSuccess(`You're checked in! You earned ${reward.coinsEarned} coins. ✓`);
      } else {
        setSuccess(
          reward?.reason
            ? `You're checked in! ${reward.reason}.`
            : "You're checked in! See you at the pickup point. ✓",
        );
      }
      fetchStatus();
      setTimeout(() => setSuccess(""), 6000);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not check in.");
    } finally {
      setCheckingIn(false);
    }
  };

  // ── auto-cancel no-shows (driver) ─────────────────────────────────────────

  const handleCancelNoShows = async () => {
    if (!window.confirm("Remove all passengers who haven't checked in? This will apply a trust score penalty to them.")) return;
    setCancelling(true);
    setError("");
    try {
      const { data } = await api.patch(`/carpool/${rideId}/auto-cancel-no-show`);
      setNoShowResult(data);
      fetchStatus();
      setTimeout(() => setNoShowResult(null), 8000);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not process no-shows.");
    } finally {
      setCancelling(false);
    }
  };

  // ── nothing to show before data loads ────────────────────────────────────

  if (loading) return null;
  if (!status)  return null;

  // Don't show for cancelled rides or rides with no passengers
  if (ride.status === "cancelled") return null;
  if (status.totalPassengers === 0 && isDriver) return null;

  // ── driver view ───────────────────────────────────────────────────────────

  if (isDriver) {
    const allCheckedIn  = status.checkedInCount === status.totalPassengers && status.totalPassengers > 0;
    const hasNoShows    = status.windowStatus === "closed" &&
      status.checkedInCount < status.totalPassengers;
    const windowIsOpen  = status.windowStatus === "open";

    return (
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        {/* header bar */}
        <button
          onClick={() => setShowPanel((v) => !v)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors"
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            allCheckedIn  ? "bg-teal-100" :
            hasNoShows    ? "bg-red-100"  :
            windowIsOpen  ? "bg-amber-100" :
            "bg-stone-100"
          }`}>
            <Users size={16} className={
              allCheckedIn  ? "text-teal-600" :
              hasNoShows    ? "text-red-500"  :
              windowIsOpen  ? "text-amber-600" :
              "text-stone-500"
            } />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-bold text-stone-800">
              Check-in Status
              <span className={`ml-2 font-black ${
                allCheckedIn ? "text-teal-600" :
                hasNoShows   ? "text-red-500"  :
                "text-stone-500"
              }`}>
                {status.checkedInCount}/{status.totalPassengers}
              </span>
            </p>
            <p className="text-xs text-stone-400">
              {status.windowStatus === "upcoming" && countdown
                ? `Window opens in ${countdown}`
                : status.windowStatus === "open" && countdown
                ? `Window closes in ${countdown}`
                : status.windowStatus === "closed"
                ? "Check-in window closed"
                : "Tap to view passenger status"}
            </p>
          </div>
          {/* progress pills */}
          <div className="flex gap-0.5 flex-shrink-0">
            {Array.from({ length: status.totalPassengers }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < status.checkedInCount ? "bg-teal-500" : "bg-stone-200"
                }`}
              />
            ))}
          </div>
        </button>

        {/* expandable passenger list */}
        {showPanel && (
          <div className="px-4 pb-4 border-t border-stone-100">
            <div className="mt-3">
              {status.passengers?.map((p) => (
                <PassengerCheckinRow key={p.userId} p={p} />
              ))}
            </div>

            {/* No-show cancellation — only available after departure */}
            {hasNoShows && (
              <button
                onClick={handleCancelNoShows}
                disabled={cancelling}
                className="mt-3 w-full py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <><Loader2 size={13} className="animate-spin" /> Processing...</>
                ) : (
                  <><AlertCircle size={13} /> Remove {status.totalPassengers - status.checkedInCount} No-Show{status.totalPassengers - status.checkedInCount !== 1 ? "s" : ""}</>
                )}
              </button>
            )}

            {noShowResult && (
              <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 font-medium">
                {noShowResult.message}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="px-4 pb-3 text-xs text-red-500">{error}</div>
        )}
      </div>
    );
  }

  // ── passenger view ────────────────────────────────────────────────────────

  const myCheckedIn = status.myStatus?.checkedIn ?? false;

  // Already checked in
  if (myCheckedIn) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-teal-50 border border-teal-200">
        <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle size={16} className="text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-teal-800">You're checked in ✓</p>

{status.myStatus?.checkedInAt && (
  <p className="text-xs text-teal-600">
    At {formatTime(status.myStatus.checkedInAt)}
  </p>
)}

{status.myStatus?.coinsEarned > 0 ? (
  <p className="text-xs font-bold text-amber-600 mt-0.5">
    +{status.myStatus.coinsEarned} coins earned
  </p>
) : status.myStatus?.rewardReason ? (
  <p className="text-xs text-stone-500 mt-0.5">
    Coins: {status.myStatus.rewardReason}
  </p>
) : null}
        </div>
      </div>
    );
  }

  // Window not open yet
  if (status.windowStatus === "upcoming") {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-stone-50 border border-stone-200">
        <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
          <Clock size={16} className="text-stone-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-stone-700">Check-in opens soon</p>
          <p className="text-xs text-stone-400">
            {countdown ? `Opens in ${countdown}` : `Opens 15 min before departure`}
          </p>
        </div>
        <span className="text-xs font-black text-stone-500 tabular-nums bg-white border border-stone-200 px-2 py-1 rounded-lg">
          {countdown || "--:--"}
        </span>
      </div>
    );
  }

  // Window is open — show the check-in button
  if (status.windowStatus === "open") {
    return (
      <div className="space-y-2">
        {success ? (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-teal-50 border border-teal-200">
            <CheckCircle size={16} className="text-teal-600 flex-shrink-0" />
            <p className="text-xs font-bold text-teal-800">{success}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
              <AlertCircle size={13} className="text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium flex-1">
                Check-in window is open — tap below to confirm your arrival.
              </p>
              <span className="text-xs font-black text-amber-600 tabular-nums">
                {countdown}
              </span>
            </div>
            <button
              onClick={handleCheckin}
              disabled={checkingIn}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {checkingIn ? (
                <><Loader2 size={15} className="animate-spin" /> Checking in...</>
              ) : (
                <><CheckCircle size={15} /> I've Arrived</>
              )}
            </button>
          </>
        )}
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}
      </div>
    );
  }

  // Window closed, passenger did not check in
  if (status.windowStatus === "closed" && !myCheckedIn) {
    return (
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-red-50 border border-red-200">
        <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle size={16} className="text-red-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-red-700">You missed check-in</p>
          <p className="text-xs text-red-500">The check-in window has closed.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default CheckInButton;