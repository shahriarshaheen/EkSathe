import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  MapPin,
  Home,
  Shield,
  Bell,
  ArrowLeft,
  Plus,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import CarpoolMapPicker from "../components/CarpoolMapPicker";
import api from "../lib/api";

const TAKA = "\u09F3";
const ARROW = "\u2192";

const navItems = [
  { path: "/dashboard", label: "Overview", icon: Home },
  { path: "/dashboard/parking", label: "Find Parking", icon: MapPin },
  { path: "/dashboard/carpool", label: "Carpooling", icon: Car },
  { path: "/dashboard/sos", label: "SOS & Safety", icon: Shield },
  {
    path: "/dashboard/notifications",
    label: "Notifications",
    icon: Bell,
    soon: true,
  },
];

const statusStyle = {
  open: "bg-teal-50 border-teal-200 text-teal-700",
  full: "bg-orange-50 border-orange-200 text-orange-600",
  cancelled: "bg-red-50 border-red-200 text-red-500",
  completed: "bg-stone-100 border-stone-200 text-stone-500",
};

const RideCard = ({
  ride,
  isDriver,
  onCancel,
  onLeave,
  cancelling,
  leaving,
}) => {
  const [expanded, setExpanded] = useState(false);
  const departure = new Date(ride.departureTime);
  const isPast = departure < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Color bar */}
      <div
        className={`h-1 w-full ${
          ride.status === "cancelled"
            ? "bg-red-400"
            : ride.status === "full"
              ? "bg-orange-400"
              : ride.status === "completed"
                ? "bg-stone-300"
                : "bg-gradient-to-r from-teal-400 to-teal-500"
        }`}
      />

      <div className="p-5">
        {/* Route + status */}
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
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusStyle[ride.status]}`}
            >
              {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
            </span>
            {isDriver && (
              <span className="text-xs bg-blue-50 border border-blue-200 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                Driver
              </span>
            )}
            {!isDriver && (
              <span className="text-xs bg-violet-50 border border-violet-200 text-violet-600 px-2 py-0.5 rounded-full font-semibold">
                Passenger
              </span>
            )}
          </div>
        </div>

        {/* Info row */}
        <div className="flex items-center gap-4 py-3 border-t border-b border-stone-50 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-semibold">
              {departure.toLocaleDateString("en-BD", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="text-stone-400">
              {departure.toLocaleTimeString("en-BD", {
                hour: "2-digit",
                minute: "2-digit",
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
          <div className="w-px h-4 bg-stone-200" />
          <span className="text-sm font-bold text-teal-600 ml-auto">
            {TAKA}
            {ride.pricePerSeat}/seat
          </span>
        </div>

        {/* Driver info — only show if passenger */}
        {!isDriver && ride.driver && (
          <div className="flex items-center gap-2 mb-3 bg-stone-50 rounded-xl px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
              {ride.driver.photoUrl ? (
                <img
                  src={ride.driver.photoUrl}
                  className="w-full h-full rounded-full object-cover"
                  alt={ride.driver.name}
                />
              ) : (
                <span className="text-xs font-bold text-teal-600">
                  {ride.driver.name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-stone-700">
                {ride.driver.name}
              </p>
              <p className="text-xs text-stone-400">
                Driver · Trust score {ride.driver.trustScore}
              </p>
            </div>
          </div>
        )}

        {/* Passengers — only show if driver */}
        {isDriver && ride.passengers?.length > 0 && (
          <div className="mb-3 bg-stone-50 rounded-xl px-3 py-2">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Passengers ({ride.passengers.length})
            </p>
            <div className="flex flex-col gap-1.5">
              {ride.passengers.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    {p.photoUrl ? (
                      <img
                        src={p.photoUrl}
                        className="w-full h-full rounded-full object-cover"
                        alt={p.name}
                      />
                    ) : (
                      <span className="text-xs font-bold text-teal-600">
                        {p.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-stone-700">
                    {p.name || "Anonymous"}
                  </span>
                  {p.trustScore != null && (
                    <span className="ml-auto text-xs text-amber-600 font-bold">
                      ★ {p.trustScore}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {isDriver &&
          ride.passengers?.length === 0 &&
          ride.status === "open" && (
            <div className="mb-3 bg-stone-50 rounded-xl px-3 py-2">
              <p className="text-xs text-stone-400 text-center py-1">
                No passengers yet — share this ride with friends
              </p>
            </div>
          )}

        {/* Expand map button */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-teal-600 transition-colors py-1 mb-3"
        >
          <MapPin className="w-3.5 h-3.5" />
          {expanded ? "Hide map" : "Show route on map"}
          {expanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>

        {/* Map */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <CarpoolMapPicker
                pickup={{
                  name: ride.origin.name,
                  area: ride.origin.area,
                  lat: ride.origin.lat,
                  lng: ride.origin.lng,
                }}
                dropoff={{
                  name: ride.destination.name,
                  area: ride.destination.area,
                  lat: ride.destination.lat,
                  lng: ride.destination.lng,
                }}
                onPickup={() => {}}
                onDropoff={() => {}}
                onReset={() => {}}
                presetOrigin={ride.origin}
                presetDestination={ride.destination}
                readOnly
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {isDriver &&
          !isPast &&
          ride.status !== "cancelled" &&
          ride.status !== "completed" && (
            <button
              onClick={() => onCancel(ride._id)}
              disabled={cancelling === ride._id}
              className="w-full py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm font-bold text-red-500 hover:bg-red-100 transition-all disabled:opacity-50"
            >
              {cancelling === ride._id ? "Cancelling..." : "Cancel Ride"}
            </button>
          )}

        {!isDriver &&
          !isPast &&
          ride.status !== "cancelled" &&
          ride.status !== "completed" && (
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
  );
};

export default function MyRides() {
  const navigate = useNavigate();
  const [posted, setPosted] = useState([]);
  const [joined, setJoined] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("posted");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const [leaving, setLeaving] = useState(null);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const res = await api.get("/carpool/my");
      setPosted(res.data.data.posted || []);
      setJoined(res.data.data.joined || []);
    } catch {
      setError("Could not load your rides.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this ride? All passengers will be notified."))
      return;
    setCancelling(id);
    try {
      await api.patch(`/carpool/routes/${id}/cancel`);
      setSuccess("Ride cancelled.");
      fetchRides();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Could not cancel.");
    } finally {
      setCancelling(null);
    }
  };

  const handleLeave = async (id) => {
    if (!window.confirm("Leave this ride?")) return;
    setLeaving(id);
    try {
      await api.delete(`/carpool/routes/${id}/leave`);
      setSuccess("You have left the ride.");
      fetchRides();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Could not leave ride.");
    } finally {
      setLeaving(null);
    }
  };

  const activePosted = posted.filter(
    (r) => r.status === "open" || r.status === "full",
  );
  const pastPosted = posted.filter(
    (r) =>
      r.status === "cancelled" ||
      r.status === "completed" ||
      new Date(r.departureTime) < new Date(),
  );
  const activeJoined = joined.filter(
    (r) => r.status === "open" || r.status === "full",
  );
  const pastJoined = joined.filter(
    (r) =>
      r.status === "cancelled" ||
      r.status === "completed" ||
      new Date(r.departureTime) < new Date(),
  );

  const currentPosted = tab === "posted" ? activePosted : pastPosted;
  const currentJoined = tab === "posted" ? activeJoined : pastJoined;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="min-h-screen dashboard-bg">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-2xl font-bold text-stone-900">My Rides</h1>
              <button
                onClick={() => navigate("/dashboard/carpool/post")}
                className="flex items-center gap-1.5 bg-teal-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Post Ride
              </button>
            </div>
            <p className="text-stone-400 text-sm">
              All rides you've posted or joined
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-4 gap-3 mb-6"
          >
            {[
              { label: "Posted", value: posted.length, color: "text-blue-600" },
              {
                label: "Joined",
                value: joined.length,
                color: "text-violet-600",
              },
              {
                label: "Active",
                value: activePosted.length + activeJoined.length,
                color: "text-teal-600",
              },
              {
                label: "Past",
                value: pastPosted.length + pastJoined.length,
                color: "text-stone-400",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-stone-200 p-3 text-center hover:-translate-y-0.5 hover:shadow-sm transition-all"
              >
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Active / Past tabs */}
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-5">
            {["posted", "past"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
                  tab === t
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                {t === "posted" ? "Active" : "Past"}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {success && (
            <div className="rounded-2xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-700 mb-4 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
              <p className="text-sm text-stone-400">Loading your rides...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Posted by me */}
              <div>
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                  Rides I Posted ({currentPosted.length})
                </h2>
                {currentPosted.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
                    <Car className="w-8 h-8 text-stone-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-stone-500 mb-1">
                      {tab === "posted"
                        ? "No active rides posted"
                        : "No past rides"}
                    </p>
                    {tab === "posted" && (
                      <button
                        onClick={() => navigate("/dashboard/carpool/post")}
                        className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        Post a ride →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {currentPosted.map((ride) => (
                      <RideCard
                        key={ride._id}
                        ride={ride}
                        isDriver
                        onCancel={handleCancel}
                        onLeave={handleLeave}
                        cancelling={cancelling}
                        leaving={leaving}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Joined rides */}
              <div>
                <h2 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
                  Rides I Joined ({currentJoined.length})
                </h2>
                {currentJoined.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
                    <Users className="w-8 h-8 text-stone-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-stone-500 mb-1">
                      {tab === "posted"
                        ? "You haven't joined any rides yet"
                        : "No past joined rides"}
                    </p>
                    {tab === "posted" && (
                      <button
                        onClick={() => navigate("/dashboard/carpool")}
                        className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        Browse rides →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {currentJoined.map((ride) => (
                      <RideCard
                        key={ride._id}
                        ride={ride}
                        isDriver={false}
                        onCancel={handleCancel}
                        onLeave={handleLeave}
                        cancelling={cancelling}
                        leaving={leaving}
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
