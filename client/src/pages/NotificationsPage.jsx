import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Package, Car, Star, CreditCard, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/ui/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../services/notificationService";
import {
  Home, MapPin, CalendarDays, Shield, ShieldAlert, Banknote,
  ParkingSquare, Users,
} from "lucide-react";

const getStudentNavItems = () => [
  { path: "/dashboard", label: "Overview", icon: Home },
  { path: "/dashboard/parking", label: "Find Parking", icon: MapPin },
  { path: "/dashboard/bookings", label: "My Bookings", icon: CalendarDays },
  { path: "/dashboard/carpool", label: "Carpooling", icon: Car },
  { path: "/dashboard/sos", label: "SOS & Safety", icon: Shield },
  { path: "/dashboard/report-incident", label: "Report Incident", icon: ShieldAlert },
  { path: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const getHomeownerNavItems = () => [
  { path: "/dashboard", label: "Overview", icon: Home },
  { path: "/dashboard/my-listings", label: "My Listings", icon: ParkingSquare },
  { path: "/dashboard/homeowner-bookings", label: "Bookings", icon: Users },
  { path: "/dashboard/earnings", label: "Earnings", icon: Banknote },
  { path: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

const TYPE_CONFIG = {
  booking_request: { icon: Package, color: "bg-blue-50 text-blue-600" },
  payment_success: { icon: CreditCard, color: "bg-green-50 text-green-600" },
  carpool_payment: { icon: Car, color: "bg-teal-50 text-teal-600" },
  new_passenger: { icon: Car, color: "bg-violet-50 text-violet-600" },
  rating_received: { icon: Star, color: "bg-amber-50 text-amber-600" },
  pricing_nudge: { icon: Banknote, color: "bg-orange-50 text-orange-600" },
  general: { icon: Bell, color: "bg-stone-100 text-stone-600" },
};

const timeAgo = (date) => {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const navItems = user?.role === "homeowner"
    ? getHomeownerNavItems()
    : getStudentNavItems();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyNotifications();
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 transition-colors lg:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="p-2 bg-stone-100 rounded-lg">
              <Bell className="w-5 h-5 text-stone-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Notifications</h1>
              <p className="text-sm text-stone-500">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-teal-600 transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center gap-2 text-stone-400 text-sm">
            <div className="w-4 h-4 border-2 border-stone-300 border-t-transparent rounded-full animate-spin" />
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
            <Bell className="w-10 h-10 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-500 text-sm font-medium">No notifications yet</p>
            <p className="text-stone-400 text-xs mt-1">
              You'll be notified about bookings, payments, and more.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.map((n) => {
                const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.general;
                const Icon = config.icon;
                return (
                  <motion.div
                    key={n._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    onClick={() => !n.read && handleMarkAsRead(n._id)}
                    className={`flex gap-4 p-4 rounded-xl border transition-all cursor-pointer
                      ${n.read
                        ? "bg-white border-stone-200 opacity-70"
                        : "bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold ${n.read ? "text-stone-500" : "text-stone-800"}`}>
                          {n.title}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-stone-400">{timeAgo(n.createdAt)}</span>
                          {!n.read && (
                            <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}