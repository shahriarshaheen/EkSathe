import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ParkingSquare,
  Users,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  PlusCircle,
  Banknote,
  MessageCircle,
} from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const navItems = [
  { path: "/dashboard", label: "Overview", icon: Home },
  { path: "/dashboard/my-listings", label: "My Listings", icon: ParkingSquare },
  // FIX: removed soon:true so homeowners can access bookings page
  { path: "/dashboard/bookings", label: "Bookings", icon: Users },
  { path: "/dashboard/earnings", label: "Earnings", icon: Banknote },
  {
    path: "/dashboard/notifications",
    label: "Notifications",
    icon: Bell,
    soon: true,
  },
];

const StatCard = ({ label, value, sub, icon: Icon, accent, bg }) => (
  <div className="bg-white rounded-xl border border-stone-200 p-5">
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">
        {label}
      </p>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}
      >
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
    </div>
    <p className="text-2xl font-bold text-stone-900">{value}</p>
    {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
  </div>
);

const HomeownerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] || "there";

  // FIX: fetch real stats instead of hardcoded zeros
  const [stats, setStats] = useState({
    activeListings: 0,
    totalBookings: 0,
    earnings: 0,
  });

  useEffect(() => {
    // Fetch listings count
    api
      .get("/parking/my/listings")
      .then((r) => {
        const listings = r.data.data || [];
        setStats((prev) => ({
          ...prev,
          activeListings: listings.filter((l) => l.isActive !== false).length,
        }));
      })
      .catch(() => {});

    // Fetch bookings and compute earnings
    api
      .get("/bookings/homeowner")
      .then((r) => {
        const bookings = r.data.data || [];
        const confirmed = bookings.filter((b) => b.status === "confirmed");
        const earnings = confirmed.reduce(
          (sum, b) => sum + (b.totalPrice || 0),
          0,
        );
        setStats((prev) => ({
          ...prev,
          totalBookings: bookings.length,
          earnings,
        }));
      })
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Manage your parking listings and track your bookings.
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/create-listing")}
            className="hidden sm:flex items-center gap-2 bg-stone-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Listing
          </button>
        </div>

        {/* Stats — FIX: now showing real data */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Active Listings"
            value={stats.activeListings}
            sub={
              stats.activeListings > 0 ? "View listings" : "No spots listed yet"
            }
            icon={ParkingSquare}
            accent="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            label="Total Bookings"
            value={stats.totalBookings}
            sub="All time"
            icon={Users}
            accent="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            label="Earnings"
            value={`৳${stats.earnings}`}
            sub="Confirmed bookings"
            icon={Banknote}
            accent="text-green-600"
            bg="bg-green-50"
          />
          <StatCard
            label="Trust Score"
            value={user?.trustScore ?? 0}
            sub="Build with bookings"
            icon={TrendingUp}
            accent="text-teal-600"
            bg="bg-teal-50"
          />
        </div>

        {/* Quick actions banner when bookings exist */}
        {stats.totalBookings > 0 ? (
          <div
            onClick={() => navigate("/dashboard/bookings")}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  You have {stats.totalBookings} booking
                  {stats.totalBookings !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-blue-600">
                  Tap to view and chat with students
                </p>
              </div>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        ) : (
          /* Get started banner when no listings */
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <ParkingSquare className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">
                  List your first parking spot
                </h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Turn your unused driveway or garage into a steady income.
                  Students near your area are actively looking for parking.
                </p>
                <button
                  onClick={() => navigate("/dashboard/create-listing")}
                  className="mt-3 text-sm font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors"
                >
                  Get started <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-sm font-semibold text-stone-700 mb-5">
              How EkSathe Works for You
            </h3>
            <div className="space-y-4">
              {[
                {
                  step: "01",
                  title: "List your space",
                  desc: "Add your parking spot with photos, availability, and pricing.",
                },
                {
                  step: "02",
                  title: "Students book it",
                  desc: "Verified students near your area find and book your space.",
                },
                {
                  step: "03",
                  title: "Earn consistently",
                  desc: "Get paid directly. Build your rating with each successful booking.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">
                      {item.title}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-stone-100 flex gap-3">
              <button
                onClick={() => navigate("/dashboard/create-listing")}
                className="flex-1 bg-stone-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-stone-800 transition-colors"
              >
                Add listing
              </button>
              <button
                onClick={() => navigate("/dashboard/my-listings")}
                className="flex-1 bg-stone-100 text-stone-700 text-sm font-semibold py-2.5 rounded-lg hover:bg-stone-200 transition-colors"
              >
                View my listings
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-4">
              Your Profile
            </h3>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-100 flex items-center justify-center overflow-hidden">
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-amber-600">
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-stone-800 text-sm">
                  {user?.name}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">{user?.email}</p>
              </div>
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between bg-stone-50 rounded-lg px-3 py-2">
                  <span className="text-xs text-stone-500">Status</span>
                  <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                </div>
                <div className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2">
                  <span className="text-xs text-amber-600">Trust Score</span>
                  <span className="text-sm font-bold text-amber-700">
                    {user?.trustScore ?? 0}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <Clock className="w-3 h-3" />
                Member since{" "}
                {new Date().toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HomeownerDashboard;
