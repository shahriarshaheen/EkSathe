import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Car,
  MapPin,
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  LayoutDashboard,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import CarpoolMapPicker from "../components/CarpoolMapPicker";
import api from "../lib/api";

const TAKA = "\u09F3";
const ARROW = "\u2192";

// Unified admin nav — same on all admin pages
const navItems = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/dashboard/verifications", label: "Verifications", icon: UserCheck },
  { path: "/dashboard/admin/carpool", label: "Carpool Rides", icon: Car },
  { path: "/admin/incidents", label: "Incidents", icon: ShieldAlert },
  { path: "/dashboard/admin/users", label: "User Management", icon: Users },
];

const statusStyle = {
  open: "bg-teal-50 border-teal-200 text-teal-700",
  full: "bg-orange-50 border-orange-200 text-orange-600",
  cancelled: "bg-red-50 border-red-200 text-red-500",
  completed: "bg-stone-100 border-stone-200 text-stone-500",
};

export default function AdminCarpoolPage() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const params =
        statusFilter !== "all" ? `?status=${statusFilter}` : "?status=all";
      const res = await api.get(`/carpool/admin/routes${params}`);
      setRoutes(res.data.data || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [statusFilter]);

  const handleCancel = async (id) => {
    if (!window.confirm("Force cancel this ride?")) return;
    setCancelling(id);
    try {
      await api.patch(`/carpool/admin/routes/${id}/cancel`);
      setRoutes((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "cancelled" } : r)),
      );
    } catch {
      /* silent */
    } finally {
      setCancelling(null);
    }
  };

  const filtered = routes.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.driver?.name?.toLowerCase().includes(q) ||
      r.origin?.area?.toLowerCase().includes(q) ||
      r.destination?.area?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Carpool Rides
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Monitor and moderate all rides on the platform.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by driver, origin, destination..."
            className="flex-1 px-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
          />
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
            {["all", "open", "full", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${statusFilter === s ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-stone-400 text-sm py-8">
            <div className="w-4 h-4 border-2 border-stone-300 border-t-transparent rounded-full animate-spin" />
            Loading rides...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <Car className="w-10 h-10 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-500 text-sm font-semibold">
              No rides found
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((route) => {
              const isExpanded = expandedId === route._id;
              const dep = new Date(route.departureTime);
              return (
                <motion.div
                  key={route._id}
                  layout
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden"
                >
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : route._id)}
                  >
                    {/* Route */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusStyle[route.status]}`}
                        >
                          {route.status}
                        </span>
                        <p className="text-sm font-bold text-stone-800 truncate">
                          {route.origin?.area} {ARROW} {route.destination?.area}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dep.toLocaleDateString()}{" "}
                          {dep.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {route.passengers?.length || 0}/{route.totalSeats}{" "}
                          passengers
                        </span>
                        <span className="font-semibold text-teal-600">
                          {TAKA}
                          {route.pricePerSeat}/seat
                        </span>
                      </div>
                    </div>
                    {/* Driver */}
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden">
                        {route.driver?.photoUrl ? (
                          <img
                            src={route.driver.photoUrl}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : (
                          <span className="text-xs font-bold text-stone-500">
                            {route.driver?.name?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-700">
                          {route.driver?.name}
                        </p>
                        <p className="text-xs text-stone-400">
                          {route.driver?.email}
                        </p>
                      </div>
                    </div>
                    {/* Cancel */}
                    {route.status !== "cancelled" &&
                      route.status !== "completed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(route._id);
                          }}
                          disabled={cancelling === route._id}
                          className="flex-shrink-0 text-xs font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                        >
                          {cancelling === route._id ? "..." : "Cancel"}
                        </button>
                      )}
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-stone-100 p-4 bg-stone-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                            Passengers
                          </p>
                          {route.passengers?.length > 0 ? (
                            <div className="space-y-1">
                              {route.passengers.map((p) => (
                                <div
                                  key={p._id}
                                  className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-stone-100"
                                >
                                  <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center text-xs font-bold text-teal-600">
                                    {p.name?.[0]}
                                  </div>
                                  <span className="text-xs text-stone-700">
                                    {p.name}
                                  </span>
                                  <span className="text-xs text-stone-400 ml-auto">
                                    {p.email}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-stone-400">
                              No passengers yet
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                            Details
                          </p>
                          <div className="space-y-1 text-xs text-stone-600">
                            <p>
                              <span className="text-stone-400">Origin:</span>{" "}
                              {route.origin?.name}
                            </p>
                            <p>
                              <span className="text-stone-400">
                                Destination:
                              </span>{" "}
                              {route.destination?.name}
                            </p>
                            {route.genderSafe && (
                              <p className="text-pink-600 font-semibold">
                                ♀ Female passengers only
                              </p>
                            )}
                            {route.notes && (
                              <p>
                                <span className="text-stone-400">Notes:</span>{" "}
                                {route.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
