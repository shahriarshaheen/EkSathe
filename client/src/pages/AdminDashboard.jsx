import {
  LayoutDashboard,
  Users,
  ParkingSquare,
  AlertTriangle,
  Settings,
  ShieldCheck,
  TrendingUp,
  Activity,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/dashboard/users", label: "Users", icon: Users, soon: true },
  {
    path: "/dashboard/listings",
    label: "Listings",
    icon: ParkingSquare,
    soon: true,
  },
  {
    path: "/dashboard/reports",
    label: "Reports",
    icon: AlertTriangle,
    soon: true,
  },
  {
    path: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    soon: true,
  },
];

const StatCard = ({ label, value, sub, icon: Icon, accent, bg, trend }) => (
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
    <p className={`text-2xl font-bold text-stone-900`}>{value}</p>
    <div className="flex items-center gap-1 mt-1">
      {trend && <TrendingUp className="w-3 h-3 text-green-500" />}
      {sub && <p className="text-xs text-stone-400">{sub}</p>}
    </div>
  </div>
);

const SystemRow = ({ icon: Icon, label, status, color, bg }) => (
  <div className="flex items-center justify-between py-3 border-b border-stone-50 last:border-0">
    <div className="flex items-center gap-3">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center ${bg}`}
      >
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <p className="text-sm text-stone-700 font-medium">{label}</p>
    </div>
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-full ${
        status === "Operational"
          ? "bg-green-50 text-green-600"
          : status === "Coming Soon"
            ? "bg-stone-100 text-stone-400"
            : "bg-yellow-50 text-yellow-600"
      }`}
    >
      {status}
    </span>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
              Admin Console
            </span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            System Overview
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Monitor users, listings, and platform health.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Users"
            value="1"
            sub="You just registered"
            icon={Users}
            accent="text-purple-600"
            bg="bg-purple-50"
          />
          <StatCard
            label="Active Listings"
            value="0"
            sub="No listings yet"
            icon={ParkingSquare}
            accent="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            label="Open Reports"
            value="0"
            sub="All clear"
            icon={AlertTriangle}
            accent="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            label="Uptime"
            value="100%"
            sub="All systems go"
            icon={Activity}
            accent="text-green-600"
            bg="bg-green-50"
            trend
          />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* System status */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="text-sm font-semibold text-stone-700 mb-4">
              System Status
            </h3>
            <SystemRow
              icon={ShieldCheck}
              label="Authentication"
              status="Operational"
              color="text-green-600"
              bg="bg-green-50"
            />
            <SystemRow
              icon={Users}
              label="User Management"
              status="Operational"
              color="text-green-600"
              bg="bg-green-50"
            />
            <SystemRow
              icon={ParkingSquare}
              label="Parking Module"
              status="Coming Soon"
              color="text-stone-400"
              bg="bg-stone-100"
            />
            <SystemRow
              icon={Activity}
              label="Carpool Module"
              status="Coming Soon"
              color="text-stone-400"
              bg="bg-stone-100"
            />
            <SystemRow
              icon={AlertTriangle}
              label="SOS & Safety"
              status="Coming Soon"
              color="text-stone-400"
              bg="bg-stone-100"
            />
          </div>

          {/* Admin profile */}
          <div className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="text-sm font-semibold text-stone-700 mb-4">
              Admin Profile
            </h3>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-purple-50 border-2 border-purple-100 flex items-center justify-center">
                <span className="text-xl font-bold text-purple-600">
                  {user?.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-stone-800 text-sm">
                  {user?.name}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">{user?.email}</p>
                <span className="inline-block mt-1.5 text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  Administrator
                </span>
              </div>
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between bg-stone-50 rounded-lg px-3 py-2">
                  <span className="text-xs text-stone-500">Access Level</span>
                  <span className="text-xs font-semibold text-purple-600">
                    Full Access
                  </span>
                </div>
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                  <span className="text-xs text-stone-500">Account</span>
                  <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <Clock className="w-3 h-3" />
                Since{" "}
                {new Date().toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick moderation panel */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-semibold text-stone-700 mb-4">
            Moderation Queue
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: UserCheck,
                label: "Pending Verifications",
                count: 0,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: UserX,
                label: "Flagged Accounts",
                count: 0,
                color: "text-red-500",
                bg: "bg-red-50",
              },
              {
                icon: AlertTriangle,
                label: "Unresolved Reports",
                count: 0,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 bg-stone-50 rounded-xl p-4"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.bg}`}
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-stone-900">
                    {item.count}
                  </p>
                  <p className="text-xs text-stone-400">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400 text-center mt-4">
            Moderation tools will be available when user activity begins.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
