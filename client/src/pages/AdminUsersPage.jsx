import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  Car,
  ShieldAlert,
  LayoutDashboard,
  Search,
  ShieldOff,
  Shield,
  GraduationCap,
  Home,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import api from "../lib/api";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/dashboard/verifications", label: "Verifications", icon: UserCheck },
  { path: "/dashboard/admin/carpool", label: "Carpool Rides", icon: Car },
  { path: "/admin/incidents", label: "Incidents", icon: ShieldAlert },
  { path: "/dashboard/admin/users", label: "User Management", icon: Users },
];

const ROLE_STYLES = {
  student: "bg-blue-50 text-blue-700",
  homeowner: "bg-amber-50 text-amber-700",
  admin: "bg-purple-50 text-purple-700",
};

const STATUS_STYLES = {
  active: "bg-green-50 text-green-700",
  suspended: "bg-red-50 text-red-600",
  pending_verification: "bg-stone-100 text-stone-500",
};

const ROLE_ICONS = { student: GraduationCap, homeowner: Home, admin: Shield };

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [acting, setActing] = useState(null); // userId being actioned

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 100 });
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.data || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSuspend = async (user) => {
    if (
      !window.confirm(`Suspend ${user.name}? They will not be able to log in.`)
    )
      return;
    setActing(user._id);
    try {
      await api.patch(`/admin/users/${user._id}/suspend`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, status: "suspended" } : u,
        ),
      );
      toast.success(`${user.name} suspended`);
    } catch (err) {
      toast.error(err.message || "Failed to suspend user");
    } finally {
      setActing(null);
    }
  };

  const handleUnsuspend = async (user) => {
    setActing(user._id);
    try {
      await api.patch(`/admin/users/${user._id}/unsuspend`);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: "active" } : u)),
      );
      toast.success(`${user.name} reinstated`);
    } catch (err) {
      toast.error(err.message || "Failed to unsuspend user");
    } finally {
      setActing(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const counts = {
    all: users.length,
    student: users.filter((u) => u.role === "student").length,
    homeowner: users.filter((u) => u.role === "homeowner").length,
    suspended: users.filter((u) => u.status === "suspended").length,
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS}>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            User Management
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            View, search, suspend, and reinstate platform users.
          </p>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            {
              label: "Total",
              value: counts.all,
              color: "bg-stone-100 text-stone-700",
            },
            {
              label: "Students",
              value: counts.student,
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "Homeowners",
              value: counts.homeowner,
              color: "bg-amber-50 text-amber-700",
            },
            {
              label: "Suspended",
              value: counts.suspended,
              color: "bg-red-50 text-red-600",
            },
          ].map((pill) => (
            <div
              key={pill.label}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${pill.color}`}
            >
              <span>{pill.value}</span>
              <span>{pill.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">All roles</option>
            <option value="student">Students</option>
            <option value="homeowner">Homeowners</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending_verification">Pending</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center gap-2 text-stone-400 text-sm py-8">
            <div className="w-4 h-4 border-2 border-stone-300 border-t-transparent rounded-full animate-spin" />
            Loading users...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <Users className="w-10 h-10 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-500 text-sm font-semibold">
              No users found
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-stone-50 border-b border-stone-100 text-xs font-bold text-stone-400 uppercase tracking-widest">
              <div className="col-span-4">User</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 hidden sm:block">Trust</div>
              <div className="col-span-2">Action</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-stone-50">
              {filtered.map((u) => {
                const RoleIcon = ROLE_ICONS[u.role] || Users;
                const isSuspended = u.status === "suspended";
                const isAdmin = u.role === "admin";
                return (
                  <div
                    key={u._id}
                    className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center hover:bg-stone-50 transition-colors"
                  >
                    {/* User */}
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-stone-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {u.photoUrl ? (
                          <img
                            src={u.photoUrl}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : (
                          <span className="text-xs font-bold text-stone-500">
                            {u.name?.[0]?.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-800 truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-stone-400 truncate">
                          {u.email}
                        </p>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="col-span-2">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${ROLE_STYLES[u.role] || "bg-stone-100 text-stone-600"}`}
                      >
                        <RoleIcon className="w-3 h-3" />
                        {u.role}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_STYLES[u.status] || "bg-stone-100 text-stone-500"}`}
                      >
                        {u.status === "pending_verification"
                          ? "pending"
                          : u.status}
                      </span>
                    </div>

                    {/* Trust score */}
                    <div className="col-span-2 hidden sm:block">
                      <span className="text-sm font-bold text-teal-600">
                        {u.trustScore ?? 0}
                      </span>
                      <span className="text-xs text-stone-400 ml-1">pts</span>
                    </div>

                    {/* Action */}
                    <div className="col-span-2">
                      {isAdmin ? (
                        <span className="text-xs text-stone-300 font-medium">
                          —
                        </span>
                      ) : isSuspended ? (
                        <button
                          onClick={() => handleUnsuspend(u)}
                          disabled={acting === u._id}
                          className="flex items-center gap-1 text-xs font-bold text-green-600 border border-green-200 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <Shield className="w-3 h-3" />
                          {acting === u._id ? "..." : "Reinstate"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspend(u)}
                          disabled={acting === u._id}
                          className="flex items-center gap-1 text-xs font-bold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <ShieldOff className="w-3 h-3" />
                          {acting === u._id ? "..." : "Suspend"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
