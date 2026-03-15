import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "sonner";
import { MapPin, LogOut, Menu, X, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

const roleBadgeStyle = {
  student: "bg-teal-100 text-teal-700",
  homeowner: "bg-amber-100 text-amber-700",
  admin: "bg-purple-100 text-purple-700",
};

const UserAvatar = ({ user, size = "sm" }) => {
  const sizeClass = size === "sm" ? "w-9 h-9 text-sm" : "w-8 h-8 text-xs";
  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden bg-stone-100 flex items-center justify-center flex-shrink-0`}
    >
      {user?.photoUrl ? (
        <img
          src={user.photoUrl}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-semibold text-stone-600">
          {user?.name?.[0]?.toUpperCase()}
        </span>
      )}
    </div>
  );
};

const DashboardLayout = ({ children, navItems }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* ── Sidebar — desktop ── */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col bg-white border-r border-stone-200 fixed h-full z-20">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-stone-900 tracking-tight">
              EkSathe
            </span>
          </div>
        </div>

        {/* User info — clickable, goes to profile */}
        <button
          onClick={() => navigate("/dashboard/profile")}
          className="px-4 py-4 border-b border-stone-100 hover:bg-stone-50 transition-colors text-left w-full"
        >
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-800 truncate">
                {user?.name}
              </p>
              <span
                className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded-full capitalize",
                  roleBadgeStyle[user?.role],
                )}
              >
                {user?.role}
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
            <UserCircle className="w-3 h-3" />
            Edit profile
          </p>
        </button>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                )
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {item.soon && (
                <span className="ml-auto text-xs bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded-full">
                  Soon
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-stone-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-stone-200 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-stone-900 tracking-tight">
            EkSathe
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard/profile")}
            className="p-1"
          >
            <UserAvatar user={user} size="xs" />
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-stone-500"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-64 bg-white h-full flex flex-col shadow-xl">
            <div className="h-14 flex items-center justify-between px-4 border-b border-stone-100">
              <span className="font-bold text-stone-900">Menu</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Mobile user info */}
            <button
              onClick={() => {
                navigate("/dashboard/profile");
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 border-b border-stone-100 hover:bg-stone-50 transition-colors"
            >
              <UserAvatar user={user} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-stone-800 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-stone-400">Edit profile</p>
              </div>
            </button>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-stone-900 text-white"
                        : "text-stone-600 hover:bg-stone-100",
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="p-3 border-t border-stone-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
