import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Car,
} from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const navItems = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/dashboard/verifications", label: "Verifications", icon: UserCheck },
  { path: "/dashboard/admin/carpool", label: "Carpool Rides", icon: Car },
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
  <div className="bg-white rounded-2xl border border-stone-200 p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
        {label}
      </p>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}
      >
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
    </div>
    <p className="text-2xl font-bold text-stone-900">{value}</p>
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
      className={`text-xs font-bold px-2 py-1 rounded-full ${
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
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    pendingVerifications: 0,
    totalHomeowners: 0,
    activeCarpools: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [adminRes, carpoolRes] = await Promise.all([
        api.get("/admin/stats"),
        api
          .get("/carpool/admin/routes?status=open")
          .catch(() => ({ data: { data: [] } })),
      ]);
      setStats({
        ...adminRes.data.stats,
        activeCarpools: carpoolRes.data.data?.length || 0,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">
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
            value={stats.totalUsers}
            sub="All roles"
            icon={Users}
            accent="text-purple-600"
            bg="bg-purple-50"
          />
          <StatCard
            label="Students"
            value={stats.totalStudents}
            sub={`${stats.totalHomeowners} homeowners`}
            icon={UserCheck}
            accent="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            label="Pending Verifications"
            value={stats.pendingVerifications}
            sub="Student IDs to review"
            icon={AlertTriangle}
            accent="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            label="Active Carpools"
            value={stats.activeCarpools}
            sub="Open rides now"
            icon={Car}
            accent="text-teal-600"
            bg="bg-teal-50"
            trend
          />
        </div>

        {/* Pending verifications banner */}
        {stats.pendingVerifications > 0 && (
          <div
            onClick={() => navigate("/dashboard/verifications")}
            className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between cursor-pointer hover:bg-amber-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-900">
                  {stats.pendingVerifications} student
                  {stats.pendingVerifications !== 1 ? "s" : ""} waiting for ID
                  verification
                </p>
                <p className="text-xs text-amber-600">
                  Click to review and approve
                </p>
              </div>
            </div>
            <span className="text-amber-600 font-bold text-lg">→</span>
          </div>
        )}

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* System status */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6">
            <h3 className="text-sm font-bold text-stone-700 mb-4 uppercase tracking-widest">
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
              icon={UserCheck}
              label="Student Verification"
              status="Operational"
              color="text-green-600"
              bg="bg-green-50"
            />
            <SystemRow
              icon={ParkingSquare}
              label="Parking Module"
              status="Operational"
              color="text-green-600"
              bg="bg-green-50"
            />
            <SystemRow
              icon={Car}
              label="Carpool Module"
              status="Operational"
              color="text-green-600"
              bg="bg-green-50"
            />
            <SystemRow
              icon={AlertTriangle}
              label="SOS & Safety"
              status="Operational"
              color="text-green-600"
              bg="bg-green-50"
            />
            <SystemRow
              icon={Activity}
              label="Push Notifications"
              status="Coming Soon"
              color="text-stone-400"
              bg="bg-stone-100"
            />
          </div>

          {/* Admin profile */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h3 className="text-sm font-bold text-stone-700 mb-4 uppercase tracking-widest">
              Admin Profile
            </h3>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-purple-50 border-2 border-purple-100 flex items-center justify-center">
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-purple-600">
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-bold text-stone-900 text-sm">{user?.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">{user?.email}</p>
                <span className="inline-block mt-1.5 text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  Administrator
                </span>
              </div>
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2">
                  <span className="text-xs text-stone-500">Access Level</span>
                  <span className="text-xs font-bold text-purple-600">
                    Full Access
                  </span>
                </div>
                <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2">
                  <span className="text-xs text-stone-500">Account</span>
                  <span className="text-xs font-bold text-green-600 flex items-center gap-1">
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

        {/* Moderation queue */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h3 className="text-sm font-bold text-stone-700 mb-4 uppercase tracking-widest">
            Moderation Queue
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                icon: UserCheck,
                label: "Pending Verifications",
                count: stats.pendingVerifications,
                color: "text-blue-600",
                bg: "bg-blue-50",
                path: "/dashboard/verifications",
              },
              {
                icon: Car,
                label: "Active Carpools",
                count: stats.activeCarpools,
                color: "text-teal-600",
                bg: "bg-teal-50",
                path: "/dashboard/admin/carpool",
              },
              {
                icon: UserX,
                label: "Flagged Accounts",
                count: 0,
                color: "text-red-500",
                bg: "bg-red-50",
                path: null,
              },
            ].map((item) => (
              <div
                key={item.label}
                onClick={() => item.path && navigate(item.path)}
                className={`flex items-center gap-3 bg-stone-50 rounded-2xl p-4 ${item.path ? "cursor-pointer hover:bg-stone-100 transition-colors" : ""}`}
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
