import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Car,
  Shield,
  Bell,
  Home,
  Navigation,
  Star,
  Clock,
  CalendarDays,
  ShieldAlert,
} from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

// FIX: added My Bookings, My Ratings, Report Incident to student nav
// removed from MyBookingsPage navItems (each page should have role-correct nav)
const navItems = [
  { path: "/dashboard", label: "Overview", icon: Home },
  { path: "/dashboard/parking", label: "Find Parking", icon: MapPin },
  { path: "/dashboard/bookings", label: "My Bookings", icon: CalendarDays },
  { path: "/dashboard/carpool", label: "Carpooling", icon: Car },
  { path: "/dashboard/sos", label: "SOS & Safety", icon: Shield },
  { path: "/dashboard/ratings", label: "My Ratings", icon: Star },
  {
    path: "/dashboard/report-incident",
    label: "Report Incident",
    icon: ShieldAlert,
  },
  {
    path: "/dashboard/notifications",
    label: "Notifications",
    icon: Bell,
    soon: true,
  },
];

const StatCard = ({ label, value, sub, accent }) => (
  <div className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col gap-1">
    <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">
      {label}
    </p>
    <p className={`text-2xl font-bold ${accent || "text-stone-900"}`}>
      {value}
    </p>
    {sub && <p className="text-xs text-stone-400">{sub}</p>}
  </div>
);

const QuickCard = ({ icon: Icon, title, desc, badge, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-stone-200 p-5 flex gap-4 items-start hover:border-stone-300 hover:shadow-sm transition-all ${onClick ? "cursor-pointer" : "cursor-default"}`}
  >
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
    >
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <p className="text-sm font-semibold text-stone-800">{title}</p>
        {badge && (
          <span className="text-xs bg-teal-50 text-teal-600 border border-teal-100 px-1.5 py-0.5 rounded-full font-medium">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-stone-400 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const ActivityRow = ({ icon: Icon, text, time, color }) => (
  <div className="flex items-center gap-3 py-3 border-b border-stone-50 last:border-0">
    <div
      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
    >
      <Icon className="w-3.5 h-3.5" />
    </div>
    <p className="flex-1 text-sm text-stone-600">{text}</p>
    <p className="text-xs text-stone-400 flex-shrink-0">{time}</p>
  </div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] || "there";
  const [ridesShared, setRidesShared] = useState(0);

  useEffect(() => {
    api
      .get("/carpool/my")
      .then((r) => {
        const posted =
          r.data.data.posted?.filter(
            (r) => r.status !== "cancelled" && r.status !== "completed",
          ).length || 0;
        const joined =
          r.data.data.joined?.filter(
            (r) => r.status !== "cancelled" && r.status !== "completed",
          ).length || 0;
        setRidesShared(posted + joined);
      })
      .catch(() => setRidesShared(0));
  }, []);

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Here's what's happening around campus today.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Saved Spots" value="0" sub="No favorites yet" />
          <StatCard
            label="Rides Shared"
            value={ridesShared}
            sub={ridesShared > 0 ? "View My Rides" : "Start carpooling"}
            accent={ridesShared > 0 ? "text-teal-600" : "text-stone-900"}
          />
          <StatCard
            label="Trust Score"
            value={user?.trustScore ?? 0}
            sub="Build your score"
            accent="text-teal-600"
          />
          <StatCard
            label="Campus Safety"
            value="Active"
            sub="SOS available"
            accent="text-green-600"
          />
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <QuickCard
              icon={MapPin}
              title="Find Parking"
              desc="Discover available spots near your campus or destination."
              color="bg-teal-50 text-teal-600"
              onClick={() => navigate("/dashboard/parking")}
            />
            <QuickCard
              icon={Car}
              title="Join a Carpool"
              desc="Share your daily commute and split fuel costs with others."
              color="bg-blue-50 text-blue-600"
              onClick={() => navigate("/dashboard/carpool")}
            />
            <QuickCard
              icon={Navigation}
              title="Post a Ride"
              desc="Offer your seat and help fellow students get to campus."
              color="bg-violet-50 text-violet-600"
              onClick={() => navigate("/dashboard/carpool/post")}
            />
            <QuickCard
              icon={Shield}
              title="SOS & Safety"
              desc="One tap emergency alert — sends your location to trusted contacts."
              color="bg-red-50 text-red-500"
              onClick={() => navigate("/dashboard/sos")}
            />
          </div>
        </div>

        {ridesShared > 0 && (
          <div
            onClick={() => navigate("/dashboard/carpool/my-rides")}
            className="mb-8 bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-teal-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-teal-800">
                  You have {ridesShared} active carpool ride
                  {ridesShared !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-teal-600">Tap to view your rides</p>
              </div>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0d9488"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-4">
              Recent Activity
            </h3>
            <ActivityRow
              icon={Star}
              text="Account created successfully"
              time="Just now"
              color="bg-teal-50 text-teal-500"
            />
            <ActivityRow
              icon={Shield}
              text="Email verified"
              time="Just now"
              color="bg-green-50 text-green-500"
            />
            <div className="pt-4 text-center">
              <p className="text-xs text-stone-400">
                Your activity will appear here as you use EkSathe.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-4">
              Your Profile
            </h3>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center overflow-hidden">
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-teal-600">
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
              {user?.studentId && (
                <div className="w-full bg-stone-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-stone-400">Student ID</p>
                  <p className="text-sm font-mono font-medium text-stone-700">
                    {user?.studentId}
                  </p>
                </div>
              )}
              <div className="w-full bg-teal-50 rounded-lg px-3 py-2">
                <p className="text-xs text-teal-500">Trust Score</p>
                <p className="text-lg font-bold text-teal-700">
                  {user?.trustScore ?? 0}
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/ratings")}
                className="w-full text-xs font-semibold text-stone-500 hover:text-teal-600 transition-colors py-1"
              >
                View my ratings →
              </button>
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

export default StudentDashboard;
