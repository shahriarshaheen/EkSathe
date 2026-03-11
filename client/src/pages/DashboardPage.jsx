import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, MapPin, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const roleBadge = {
  student: "bg-teal-50 text-teal-700 border-teal-200",
  homeowner: "bg-amber-50 text-amber-700 border-amber-200",
  admin: "bg-purple-50 text-purple-700 border-purple-200",
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top nav */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-stone-900 tracking-tight">
              EkSathe
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-stone-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-stone-900">
                  Welcome, {user?.name?.split(" ")[0]}
                </h1>
                {user?.role && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${
                      roleBadge[user.role] ||
                      "bg-stone-100 text-stone-600 border-stone-200"
                    }`}
                  >
                    {user.role}
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Placeholder feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              label: "Parking",
              desc: "Find and list parking spots near campus.",
              soon: true,
            },
            {
              label: "Carpooling",
              desc: "Share rides with fellow students.",
              soon: true,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-stone-200 p-6 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-stone-800">{card.label}</h2>
                {card.soon && (
                  <span className="text-xs font-medium bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-400">{card.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
