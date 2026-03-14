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
} from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Overview", icon: Home },
  { path: "/dashboard/parking", label: "Find Parking", icon: MapPin },
  { path: "/dashboard/carpool", label: "Carpooling", icon: Car, soon: true },
  { path: "/dashboard/sos", label: "SOS & Safety", icon: Shield, soon: true },
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
    className="bg-white rounded-xl border border-stone-200 p-5 flex gap-4 items-start hover:border-stone-300 hover:shadow-sm transition-all cursor-pointer"
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

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Here's what's happening around campus today.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Saved Spots" value="0" sub="No favorites yet" />
          <StatCard label="Rides Shared" value="0" sub="Start carpooling" />
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

        {/* Quick actions */}
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
              badge="Coming soon"
              color="bg-blue-50 text-blue-600"
            />
            <QuickCard
              icon={Navigation}
              title="Post a Ride"
              desc="Offer your seat and help fellow students get to campus."
              badge="Coming soon"
              color="bg-violet-50 text-violet-600"
            />
            <QuickCard
              icon={Shield}
              title="SOS & Safety"
              desc="One tap emergency alert — sends your location to trusted contacts."
              badge="Coming soon"
              color="bg-red-50 text-red-500"
            />
          </div>
        </div>

        {/* Recent activity + profile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity */}
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

          {/* Profile card */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-4">
              Your Profile
            </h3>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center">
                <span className="text-xl font-bold text-teal-600">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
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
