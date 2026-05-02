import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car, MapPin, Home, Shield, Bell, Plus, Clock, Users,
  ChevronDown, ChevronUp, Star, MessageCircle, Navigation,
} from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import CarpoolMapPicker from "../components/CarpoolMapPicker";
import RatingModal from "../components/RatingModal";
import ChatModal from "../components/ChatModal";
import TripShareButton from "../components/TripShareButton";
import DeviationAlertBanner from "../components/DeviationAlertBanner";
import StartTripModal from "../components/StartTripModal";
import CheckInButton from "../components/CheckInButton";
import api from "../lib/api";

const TAKA = "\u09F3";
const ARROW = "\u2192";

const navItems = [
  { path: "/dashboard",         label: "Overview",     icon: Home   },
  { path: "/dashboard/parking", label: "Find Parking", icon: MapPin },
  { path: "/dashboard/carpool", label: "Carpooling",   icon: Car    },
  { path: "/dashboard/sos",     label: "SOS & Safety", icon: Shield },
  { path: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const statusStyle = {
  open:      "bg-teal-50 border-teal-200 text-teal-700",
  full:      "bg-orange-50 border-orange-200 text-orange-600",
  cancelled: "bg-red-50 border-red-200 text-red-500",
  completed: "bg-stone-100 border-stone-200 text-stone-500",
};

const isRateable = (ride) =>
  new Date(ride.departureTime) < new Date() && ride.status !== "cancelled";

const ratedKey = (rideId, userId) => `${rideId}_${userId}`;

// ── RideCard ──────────────────────────────────────────────────────────────────

const RideCard = ({
  ride, isDriver, onCancel, onLeave,
  cancelling, leaving, ratedKeys, onRated, unreadCount,
}) => {
  const [expanded,      setExpanded]      = useState(false);
  const [ratingTarget,  setRatingTarget]  = useState(null);
  const [chatOpen,      setChatOpen]      = useState(false);
  const [startTripOpen, setStartTripOpen] = useState(false);
  const [tripIsActive,  setTripIsActive]  = useState(ride.tripActive || false);

  const departure = new Date(ride.departureTime);
  const isPast    = departure < new Date();
  const rateable  = isRateable(ride);

  // Show check-in for active rides up to 1hr after departure
  const showCheckin =
    ride.status !== "cancelled" &&
    ride.status !== "completed" &&
    new Date() < new Date(departure.getTime() + 60 * 60 * 1000);

  const canShareLocation =
    !isPast && (ride.status === "open" || ride.status === "full");

  const hasRated = (userId) =>
    ratedKeys.has(ratedKey(ride._id, userId?.toString()));

  const allRated =
    rateable &&
    (() => {
      if (!isDriver && ride.driver) return hasRated(ride.driver._id);
      if (isDriver && ride.passengers?.length > 0)
        return ride.passengers.every((p) => hasRated(p._id));
      return false;
    })();

  const participants = isDriver
    ? ride.passengers?.map((p) => ({ name: p.name, photoUrl: p.photoUrl })) || []
    : [{ name: ride.driver?.name, photoUrl: ride.driver?.photoUrl }];

  const chatTitle = `${ride.origin.area} ${ARROW} ${ride.destination.area}`;
  const canChat   = ride.status !== "cancelled";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        {/* status stripe */}
        <div className={`h-1 w-full ${
          ride.status === "cancelled" ? "bg-red-400"    :
          ride.status === "full"      ? "bg-orange-400" :
          ride.status === "completed" ? "bg-stone-300"  :
          "bg-gradient-to-r from-teal-400 to-teal-500"
        }`} />

        <div className="p-5">

          {/* ── Route + status ── */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                  <div className="w-px h-3 bg-stone-200" />
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-stone-900 truncate">
                    {ride.origin.area} {ARROW} {ride.destination.area}
                  </p>
                  <p className="text-xs text-stone-400 truncate">
                    {ride.origin.name} {ARROW} {ride.destination.name}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusStyle[ride.status]}`}>
                {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
              </span>
              {isDriver
                ? <span className="text-xs bg-blue-50 border border-blue-200 text-blue-600 px-2 py-0.5 rounded-full font-semibold">Driver</span>
                : <span className="text-xs bg-violet-50 border border-violet-200 text-violet-600 px-2 py-0.5 rounded-full font-semibold">Passenger</span>
              }
            </div>
          </div>

          {/* ── Info row ── */}
          <div className="flex items-center gap-4 py-3 border-t border-b border-stone-50 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-semibold">
                {departure.toLocaleDateString("en-BD", {
                  weekday: "short", month: "short", day: "numeric",
                })}
              </span>
              <span className="text-stone-400">
                {departure.toLocaleTimeString("en-BD", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
            <div className="w-px h-4 bg-stone-200" />
            <div className="flex items-center gap-1.5 text-xs text-stone-600">
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-semibold">
                {ride.availableSeats}/{ride.totalSeats} seats
              </span>
            </div>
            <span className="text-sm font-bold text-teal-600 ml-auto">
              {TAKA}{ride.pricePerSeat}/seat
            </span>
          </div>

          {/* ── Driver info — passenger view ── */}
          {!isDriver && ride.driver && (
            <div className="flex items-center gap-2 mb-3 bg-stone-50 rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {ride.driver.photoUrl
                  ? <img src={ride.driver.photoUrl} className="w-full h-full object-cover" alt={ride.driver.name} />
                  : <span className="text-xs font-bold text-teal-600">{ride.driver.name?.[0]?.toUpperCase()}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-700">{ride.driver.name}</p>
                <p className="text-xs text-stone-400">Driver · Trust {ride.driver.trustScore}</p>
              </div>
              {rateable && !hasRated(ride.driver._id) && (
                <button
                  onClick={() => setRatingTarget({ user: ride.driver, role: "driver" })}
                  className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-xl hover:bg-amber-100 transition-colors flex-shrink-0"
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Rate
                </button>
              )}
              {rateable && hasRated(ride.driver._id) && (
                <span className="text-xs text-teal-600 flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3 h-3 fill-teal-500 text-teal-500" /> Rated
                </span>
              )}
            </div>
          )}

          {/* ── Passengers — driver view ── */}
          {isDriver && ride.passengers?.length > 0 && (
            <div className="mb-3 bg-stone-50 rounded-xl px-3 py-2">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                Passengers ({ride.passengers.length})
              </p>
              <div className="flex flex-col gap-2">
                {ride.passengers.map((p, i) => (
                  <div key={p._id || i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {p.photoUrl
                        ? <img src={p.photoUrl} className="w-full h-full object-cover" alt={p.name} />
                        : <span className="text-xs font-bold text-teal-600">{p.name?.[0]?.toUpperCase() || "?"}</span>
                      }
                    </div>
                    <span className="text-xs font-semibold text-stone-700 flex-1">
                      {p.name || "Anonymous"}
                    </span>
                    {p.trustScore != null && (
                      <span className="text-xs text-amber-600 font-bold">★ {p.trustScore}</span>
                    )}
                    {rateable && !hasRated(p._id) && (
                      <button
                        onClick={() => setRatingTarget({ user: p, role: "passenger" })}
                        className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-xl hover:bg-amber-100 transition-colors"
                      >
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Rate
                      </button>
                    )}
                    {rateable && hasRated(p._id) && (
                      <span className="text-xs text-teal-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-teal-500 text-teal-500" /> Rated
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {isDriver && ride.passengers?.length === 0 && ride.status === "open" && (
            <div className="mb-3 bg-stone-50 rounded-xl px-3 py-2">
              <p className="text-xs text-stone-400 text-center py-1">
                No passengers yet — share this ride
              </p>
            </div>
          )}

          {allRated && (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-teal-600 bg-teal-50 rounded-xl px-3 py-2">
              <Star className="w-3.5 h-3.5 fill-teal-500 text-teal-500" />
              All ratings submitted for this ride
            </div>
          )}

          {/* ── F-14: Route Deviation Alert ── */}
          {(ride.status === "open" || ride.status === "full") && !isPast && (
            <div className="mb-3">
              <DeviationAlertBanner rideId={ride._id} isDriver={isDriver} />
            </div>
          )}

          {/* ── F-18: Check-In ── */}
          {showCheckin && (
            <div className="mb-3">
              <CheckInButton ride={ride} isDriver={isDriver} />
            </div>
          )}

          {/* ── F-13: Trip Share ── */}
          {canShareLocation && (
            <div className="mb-3">
              <TripShareButton rideId={ride._id} />
            </div>
          )}

          {/* ── Chat + Map buttons ── */}
          <div className="flex gap-2 mb-3">
            {canChat && (
              <button
                onClick={() => setChatOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-teal-50 border border-teal-200 text-xs font-bold text-teal-700 hover:bg-teal-100 transition-colors relative"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Ride Chat
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-500 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              {expanded ? "Hide map" : "Show map"}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-3"
              >
                <CarpoolMapPicker
                  pickup={{ name: ride.origin.name, area: ride.origin.area, lat: ride.origin.lat, lng: ride.origin.lng }}
                  dropoff={{ name: ride.destination.name, area: ride.destination.area, lat: ride.destination.lat, lng: ride.destination.lng }}
                  onPickup={() => {}} onDropoff={() => {}} onReset={() => {}}
                  presetOrigin={ride.origin} presetDestination={ride.destination}
                  readOnly
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── F-14: Start Trip — driver only ── */}
          {isDriver && !isPast && ride.status !== "cancelled" && ride.status !== "completed" && (
            <button
              onClick={() => setStartTripOpen(true)}
              className={`w-full mb-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tripIsActive
                  ? "bg-teal-600 text-white hover:bg-teal-700"
                  : "bg-teal-50 border border-teal-300 text-teal-700 hover:bg-teal-100"
              }`}
            >
              <Navigation className="w-4 h-4" />
              {tripIsActive ? "Tracking Active — Manage Trip" : "Start Trip & Track Route"}
            </button>
          )}

          {/* ── Cancel / Leave ── */}
          {isDriver && !isPast && ride.status !== "cancelled" && ride.status !== "completed" && (
            <button
              onClick={() => onCancel(ride._id)}
              disabled={cancelling === ride._id}
              className="w-full py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm font-bold text-red-500 hover:bg-red-100 transition-all disabled:opacity-50"
            >
              {cancelling === ride._id ? "Cancelling..." : "Cancel Ride"}
            </button>
          )}
          {!isDriver && !isPast && ride.status !== "cancelled" && ride.status !== "completed" && (
            <button
              onClick={() => onLeave(ride._id)}
              disabled={leaving === ride._id}
              className="w-full py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-bold text-stone-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all disabled:opacity-50"
            >
              {leaving === ride._id ? "Leaving..." : "Leave Ride"}
            </button>
          )}

        </div>
      </motion.div>

      {ratingTarget && (
        <RatingModal
          ratedUser={ratingTarget.user}
          contextType="carpool"
          contextId={ride._id}
          ratedRole={ratingTarget.role}
          onClose={() => setRatingTarget(null)}
          onSuccess={() => {
            onRated(ride._id, ratingTarget.user._id);
            setRatingTarget(null);
          }}
        />
      )}

      {chatOpen && (
        <ChatModal
          contextType="carpool"
          contextId={ride._id}
          title={chatTitle}
          participants={participants}
          onClose={() => setChatOpen(false)}
        />
      )}

      {startTripOpen && (
        <StartTripModal
          ride={ride}
          onClose={() => setStartTripOpen(false)}
          onTripStart={() => setTripIsActive(true)}
          onTripEnd={() => setTripIsActive(false)}
        />
      )}
    </>
  );
};

// ── MyRides page ──────────────────────────────────────────────────────────────

export default function MyRides() {
  const navigate = useNavigate();
  const [posted,  setPosted]  = useState([]);
  const [joined,  setJoined]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("active");
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [cancelling,   setCancelling]   = useState(null);
  const [leaving,      setLeaving]      = useState(null);
  const [ratedKeys,    setRatedKeys]    = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});

  const fetchRides = async () => {
    setLoading(true);
    try {
      const [ridesRes, givenRes] = await Promise.all([
        api.get("/carpool/my"),
        api.get("/ratings/given"),
      ]);
      const postedData = ridesRes.data.data.posted || [];
      const joinedData = ridesRes.data.data.joined || [];
      setPosted(postedData);
      setJoined(joinedData);

      const keys = new Set(
        givenRes.data.data.map(
          (r) => `${r.contextId?.toString()}_${r.rated?.toString?.() || r.rated}`,
        ),
      );
      setRatedKeys(keys);

      const allRides = [...postedData, ...joinedData];
      if (allRides.length > 0) {
        try {
          const unreadRes = await api.post("/messages/unread/bulk", {
            contexts: allRides.map((r) => ({
              contextType: "carpool",
              contextId: r._id,
            })),
          });
          setUnreadCounts(unreadRes.data.data || {});
        } catch { /* silent */ }
      }
    } catch {
      setError("Could not load your rides.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRides(); }, []);

  const handleRated = (rideId, userId) => {
    setRatedKeys((prev) => new Set([...prev, ratedKey(rideId, userId)]));
    setSuccess("Rating submitted!");
    setTimeout(() => setSuccess(""), 4000);
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this ride?")) return;
    setCancelling(id);
    try {
      await api.patch(`/carpool/routes/${id}/cancel`);
      setSuccess("Ride cancelled."); fetchRides();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) { setError(err.message || "Could not cancel."); }
    finally { setCancelling(null); }
  };

  const handleLeave = async (id) => {
    if (!window.confirm("Leave this ride?")) return;
    setLeaving(id);
    try {
      await api.delete(`/carpool/routes/${id}/leave`);
      setSuccess("You have left the ride."); fetchRides();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) { setError(err.message || "Could not leave ride."); }
    finally { setLeaving(null); }
  };

  const activePosted = posted.filter(
    (r) => (r.status === "open" || r.status === "full") && new Date(r.departureTime) >= new Date(),
  );
  const pastPosted = posted.filter(
    (r) => r.status === "cancelled" || r.status === "completed" || new Date(r.departureTime) < new Date(),
  );
  const activeJoined = joined.filter(
    (r) => (r.status === "open" || r.status === "full") && new Date(r.departureTime) >= new Date(),
  );
  const pastJoined = joined.filter(
    (r) => r.status === "cancelled" || r.status === "completed" || new Date(r.departureTime) < new Date(),
  );

  const currentPosted = tab === "active" ? activePosted : pastPosted;
  const currentJoined = tab === "active" ? activeJoined : pastJoined;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="min-h-screen dashboard-bg">
        <div className="max-w-2xl mx-auto px-4 py-8">

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-2xl font-bold text-stone-900">My Rides</h1>
              <button
                onClick={() => navigate("/dashboard/carpool/post")}
                className="flex items-center gap-1.5 bg-teal-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Post Ride
              </button>
            </div>
            <p className="text-stone-400 text-sm">All rides you've posted or joined</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="grid grid-cols-4 gap-3 mb-6"
          >
            {[
              { label: "Posted", value: posted.length,                             color: "text-blue-600"   },
              { label: "Joined", value: joined.length,                             color: "text-violet-600" },
              { label: "Active", value: activePosted.length + activeJoined.length, color: "text-teal-600"   },
              { label: "Past",   value: pastPosted.length  + pastJoined.length,    color: "text-stone-400"  },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-stone-200 p-3 text-center hover:-translate-y-0.5 hover:shadow-sm transition-all">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>

          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-5">
            {[["active", "Active"], ["past", "Past"]].map(([t, label]) => (
              <button
                key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${tab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {success && (
            <div className="rounded-2xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-700 mb-4 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">{error}</div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
              <p className="text-sm text-stone-400">Loading your rides...</p>
            </div>
          ) : (
            <div className="space-y-6">

              <div>
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                  Rides I Posted ({currentPosted.length})
                </h2>
                {currentPosted.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
                    <Car className="w-8 h-8 text-stone-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-stone-500 mb-1">
                      {tab === "active" ? "No active rides posted" : "No past rides"}
                    </p>
                    {tab === "active" && (
                      <button onClick={() => navigate("/dashboard/carpool/post")} className="mt-3 text-xs font-bold text-teal-600">
                        Post a ride →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {currentPosted.map((ride) => (
                      <RideCard
                        key={ride._id} ride={ride} isDriver
                        onCancel={handleCancel} onLeave={handleLeave}
                        cancelling={cancelling} leaving={leaving}
                        ratedKeys={ratedKeys} onRated={handleRated}
                        unreadCount={unreadCounts[`carpool_${ride._id}`] || 0}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
                  Rides I Joined ({currentJoined.length})
                </h2>
                {currentJoined.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
                    <Users className="w-8 h-8 text-stone-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-stone-500 mb-1">
                      {tab === "active" ? "No active joined rides" : "No past joined rides"}
                    </p>
                    {tab === "active" && (
                      <button onClick={() => navigate("/dashboard/carpool")} className="mt-3 text-xs font-bold text-teal-600">
                        Browse rides →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {currentJoined.map((ride) => (
                      <RideCard
                        key={ride._id} ride={ride} isDriver={false}
                        onCancel={handleCancel} onLeave={handleLeave}
                        cancelling={cancelling} leaving={leaving}
                        ratedKeys={ratedKeys} onRated={handleRated}
                        unreadCount={unreadCounts[`carpool_${ride._id}`] || 0}
                      />
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}