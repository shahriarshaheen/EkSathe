import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Car,
  MapPin,
  Home,
  Shield,
  Bell,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  LayoutDashboard,
  ArrowUpRight,
} from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import CarpoolMapPicker from "../components/CarpoolMapPicker";
import api from "../lib/api";

const TAKA = "\u09F3";
const ARROW = "\u2192";

const navItems = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
  {
    path: "/dashboard/verifications",
    label: "Verifications",
    icon: ShieldCheck,
  },
  { path: "/dashboard/admin/carpool", label: "Carpool Rides", icon: Car },
  {
    path: "/dashboard/reports",
    label: "Reports",
    icon: AlertTriangle,
    soon: true,
  },
];

const statusStyle = {
  open: "bg-teal-50 border-teal-200 text-teal-700",
  full: "bg-orange-50 border-orange-200 text-orange-600",
  cancelled: "bg-red-50 border-red-200 text-red-500",
  completed: "bg-stone-100 border-stone-200 text-stone-500",
};

const statusTabs = ["all", "open", "full", "cancelled", "completed"];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35 },
  }),
};

const RideRow = ({ ride, onCancel, cancelling }) => {
  const [expanded, setExpanded] = useState(false);
  const departure = new Date(ride.departureTime);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-sm transition-shadow">
      <div
        className={`h-0.5 w-full ${
          ride.status === "cancelled"
            ? "bg-red-400"
            : ride.status === "full"
              ? "bg-orange-400"
              : ride.status === "completed"
                ? "bg-stone-300"
                : "bg-teal-500"
        }`}
      />

      <div className="p-4">
        {/* Route header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-900 truncate">
              {ride.origin.area} {ARROW} {ride.destination.area}
            </p>
            <p className="text-xs text-stone-400 truncate">
              {ride.origin.name} {ARROW} {ride.destination.name}
            </p>
          </div>
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${statusStyle[ride.status]}`}
          >
            {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
          </span>
        </div>

        {/* Info strip */}
        <div className="flex items-center gap-3 text-xs text-stone-500 mb-3 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {departure.toLocaleDateString("en-BD", {
              day: "numeric",
              month: "short",
            })}{" "}
            ·{" "}
            {departure.toLocaleTimeString("en-BD", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {ride.passengers?.length || 0}/{ride.totalSeats} passengers
          </span>
          <span className="font-bold text-teal-600">
            {TAKA}
            {ride.pricePerSeat}/seat
          </span>
          {ride.genderSafe && (
            <span className="bg-pink-50 border border-pink-200 text-pink-600 rounded-full px-2 py-0.5 font-semibold">
              Female only
            </span>
          )}
        </div>

        {/* Driver */}
        {ride.driver && (
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
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-stone-700">
                {ride.driver.name}
              </p>
              <p className="text-xs text-stone-400">
                {ride.driver.email} · Trust {ride.driver.trustScore}
              </p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-full px-2 py-0.5 font-semibold flex-shrink-0">
              Driver
            </span>
          </div>
        )}

        {/* Passengers */}
        {ride.passengers?.length > 0 && (
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {ride.passengers.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-violet-50 border border-violet-100 rounded-full px-2.5 py-1"
              >
                <div className="w-4 h-4 rounded-full bg-violet-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-violet-700">
                    {(p.name || "?")[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-semibold text-violet-700">
                  {p.name || "Unknown"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {ride.notes && (
          <p className="text-xs text-stone-400 italic mb-3 bg-stone-50 rounded-xl px-3 py-2">
            {ride.notes}
          </p>
        )}

        {/* Map toggle + cancel */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-stone-400 hover:text-teal-600 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            {expanded ? "Hide map" : "View on map"}
          </button>

          {ride.status !== "cancelled" && ride.status !== "completed" && (
            <button
              onClick={() => onCancel(ride._id)}
              disabled={cancelling === ride._id}
              className="ml-auto flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              {cancelling === ride._id ? "Cancelling..." : "Force Cancel"}
            </button>
          )}
        </div>

        {/* Expandable map */}
        {expanded && (
          <div className="mt-3">
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
          </div>
        )}
      </div>
    </div>
  );
};

export default function AdminCarpoolPage() {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("all");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cancelling, setCancelling] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    full: 0,
    cancelled: 0,
    completed: 0,
  });

  const fetchRides = async () => {
    setLoading(true);
    try {
      // Admin fetches all rides — no status filter
      const res = await api.get("/carpool/admin/routes");
      const data = res.data.data || [];
      setRides(data);
      setStats({
        total: data.length,
        open: data.filter((r) => r.status === "open").length,
        full: data.filter((r) => r.status === "full").length,
        cancelled: data.filter((r) => r.status === "cancelled").length,
        completed: data.filter((r) => r.status === "completed").length,
      });
    } catch {
      setError("Could not load rides.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleForceCancel = async (id) => {
    if (!window.confirm("Force cancel this ride? This cannot be undone."))
      return;
    setCancelling(id);
    try {
      await api.patch(`/carpool/admin/routes/${id}/cancel`);
      setSuccess("Ride cancelled.");
      fetchRides();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Could not cancel.");
    } finally {
      setCancelling(null);
    }
  };

  const filtered = rides
    .filter((r) => statusTab === "all" || r.status === statusTab)
    .filter((r) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        r.origin.area.toLowerCase().includes(s) ||
        r.destination.area.toLowerCase().includes(s) ||
        r.driver?.name?.toLowerCase().includes(s) ||
        r.driver?.email?.toLowerCase().includes(s)
      );
    });

  return (
    <DashboardLayout navItems={navItems}>
      <div className="min-h-screen dashboard-bg">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-1">
              <Car className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                Admin
              </span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Carpool Moderation
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Monitor and manage all carpool rides on the platform.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6"
          >
            {[
              { label: "Total", value: stats.total, color: "text-stone-900" },
              { label: "Open", value: stats.open, color: "text-teal-600" },
              { label: "Full", value: stats.full, color: "text-orange-500" },
              {
                label: "Cancelled",
                value: stats.cancelled,
                color: "text-red-500",
              },
              {
                label: "Completed",
                value: stats.completed,
                color: "text-stone-400",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-stone-200 p-4 text-center hover:-translate-y-0.5 hover:shadow-sm transition-all"
              >
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Search */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mb-4"
          >
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search by area, driver name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-colors"
              />
            </div>
          </motion.div>

          {/* Status tabs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-6 overflow-x-auto"
          >
            {statusTabs.map((t) => (
              <button
                key={t}
                onClick={() => setStatusTab(t)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  statusTab === t
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                {t}{" "}
                {t === "all"
                  ? `(${stats.total})`
                  : t === "open"
                    ? `(${stats.open})`
                    : t === "full"
                      ? `(${stats.full})`
                      : t === "cancelled"
                        ? `(${stats.cancelled})`
                        : `(${stats.completed})`}
              </button>
            ))}
          </motion.div>

          {/* Alerts */}
          {success && (
            <div className="rounded-2xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-700 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
              {error}
            </div>
          )}

          {/* Rides list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
              <p className="text-sm text-stone-400">Loading rides...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
              <Car className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-stone-500 mb-1">
                No rides found
              </p>
              <p className="text-xs text-stone-400">
                Try a different filter or search term
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((ride, i) => (
                <motion.div
                  key={ride._id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                >
                  <RideRow
                    ride={ride}
                    onCancel={handleForceCancel}
                    cancelling={cancelling}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
