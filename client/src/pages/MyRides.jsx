import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, MapPin, Home, Shield, Bell } from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import api from "../lib/api";

const TAKA = "\u09F3";

const navItems = [
  { path: "/dashboard",               label: "Overview",     icon: Home },
  { path: "/dashboard/parking",       label: "Find Parking", icon: MapPin },
  { path: "/dashboard/carpool",       label: "Carpooling",   icon: Car },
  { path: "/dashboard/sos",           label: "SOS & Safety", icon: Shield },
  { path: "/dashboard/notifications", label: "Notifications",icon: Bell, soon: true },
];

function RideCard({ ride, type, onLeave, leaving }) {
  const departure = new Date(ride.departureTime);
  const isToday = new Date().toDateString() === departure.toDateString();
  const isCancelled = ride.status === "cancelled";
  const isFull = ride.status === "full";

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isCancelled ? "opacity-60 border-red-100" : "border-stone-200"}`}>
      <div className={`h-1 w-full ${isCancelled ? "bg-red-400" : isFull ? "bg-orange-400" : "bg-gradient-to-r from-teal-400 to-teal-500"}`}/>
      <div className="p-5">

        {/* Route */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-100"/>
              <div className="w-px h-4 bg-stone-200"/>
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100"/>
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-sm font-bold text-stone-900">{ride.origin.area}</p>
                <p className="text-xs text-stone-400">{ride.origin.name}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">{ride.destination.area}</p>
                <p className="text-xs text-stone-400">{ride.destination.name}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
              isCancelled ? "bg-red-50 border-red-200 text-red-500" :
              isFull      ? "bg-orange-50 border-orange-200 text-orange-500" :
                            "bg-teal-50 border-teal-200 text-teal-600"
            }`}>
              {isCancelled ? "Cancelled" : isFull ? "Full" : "Open"}
            </span>
            <span className={`text-base font-black ${isCancelled ? "text-stone-300 line-through" : "text-teal-600"}`}>
              {TAKA}{ride.pricePerSeat}
            </span>
            <span className="text-xs text-stone-400">per seat</span>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-stone-50 rounded-xl p-2.5 text-center">
            <p className="text-xs text-stone-400 mb-0.5">Date</p>
            <p className="text-xs font-bold text-stone-800">
              {isToday ? "Today" : departure.toLocaleDateString("en-BD", { month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="bg-stone-50 rounded-xl p-2.5 text-center">
            <p className="text-xs text-stone-400 mb-0.5">Time</p>
            <p className="text-xs font-bold text-stone-800">
              {departure.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="bg-stone-50 rounded-xl p-2.5 text-center">
            <p className="text-xs text-stone-400 mb-0.5">Seats</p>
            <p className="text-xs font-bold text-stone-800">{ride.availableSeats}/{ride.totalSeats}</p>
          </div>
        </div>

        {/* Driver for joined rides */}
        {type === "joined" && ride.driver && (
          <div className="flex items-center gap-2.5 pt-3 border-t border-stone-50 mb-3">
            {ride.driver.photoUrl ? (
              <img src={ride.driver.photoUrl} alt={ride.driver.name}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"/>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {ride.driver.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-stone-800">{ride.driver.name}</p>
              <p className="text-xs text-stone-400">Driver</p>
            </div>
          </div>
        )}

        {/* Passengers for posted rides */}
        {type === "posted" && (
          <div className="pt-3 border-t border-stone-50 mb-3">
            <p className="text-xs text-stone-400 mb-2">
              {ride.passengers?.length > 0
                ? `${ride.passengers.length} passenger${ride.passengers.length !== 1 ? "s" : ""} joined`
                : "No passengers yet"}
            </p>
            {ride.passengers?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {ride.passengers.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-full px-3 py-1">
                    {p.photoUrl ? (
                      <img src={p.photoUrl} alt={p.name} className="w-5 h-5 rounded-full object-cover"/>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                        {p.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                    <span className="text-xs text-stone-700 font-medium">{p.name || "Student"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {ride.notes && (
          <div className="bg-stone-50 rounded-xl px-3 py-2 mb-3 flex items-start gap-2">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p className="text-xs text-stone-500 italic">{ride.notes}</p>
          </div>
        )}

        {/* Fix 19 — leave ride button on joined rides */}
        {type === "joined" && !isCancelled && (
          <button
            onClick={() => onLeave(ride._id)}
            disabled={leaving === ride._id}
            className="w-full py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold text-stone-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all">
            {leaving === ride._id ? "Leaving..." : "Leave Ride"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MyRides() {
  const navigate = useNavigate();
  const [posted, setPosted]     = useState([]);
  const [joined, setJoined]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [leaveSuccess, setLeaveSuccess] = useState("");
  const [leaving, setLeaving]   = useState(null);
  const [tab, setTab]           = useState("posted");

  const loadRides = () => {
    setLoading(true);
    api.get("/carpool/my")
      .then((r) => {
        setPosted(r.data.data.posted || []);
        setJoined(r.data.data.joined || []);
      })
      .catch(() => setError("Could not load your rides."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRides(); }, []);

  // Fix 19 — leave ride handler
  const handleLeave = async (routeId) => {
    if (!window.confirm("Are you sure you want to leave this ride?")) return;
    setLeaving(routeId); setError("");
    try {
      await api.delete(`/carpool/routes/${routeId}/leave`);
      setLeaveSuccess("You have left the ride.");
      loadRides();
      setTimeout(() => setLeaveSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Could not leave ride.");
    } finally {
      setLeaving(null);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="min-h-screen bg-stone-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <button onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Dashboard
            </button>
            <span className="text-stone-300">/</span>
            <button onClick={() => navigate("/dashboard/carpool")}
              className="text-sm text-stone-400 hover:text-stone-600 transition-colors">Carpool</button>
            <span className="text-stone-300">/</span>
            <span className="text-sm text-stone-600 font-medium">My Rides</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-stone-900">My Rides</h1>
            <p className="text-sm text-stone-500 mt-1">Rides you posted and joined</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-white rounded-2xl border border-stone-200 p-1 mb-6 shadow-sm">
            <button onClick={() => setTab("posted")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                tab === "posted" ? "bg-teal-600 text-white shadow-sm" : "text-stone-500 hover:text-stone-700"
              }`}>
              Posted ({posted.length})
            </button>
            <button onClick={() => setTab("joined")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                tab === "joined" ? "bg-teal-600 text-white shadow-sm" : "text-stone-500 hover:text-stone-700"
              }`}>
              Joined ({joined.length})
            </button>
          </div>

          {leaveSuccess && (
            <div className="rounded-2xl bg-stone-50 border border-stone-200 px-5 py-4 text-sm text-stone-600 mb-4 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-stone-500 flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              {leaveSuccess}
            </div>
          )}
          {error && (
            <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-600 mb-4">{error}</div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin"/>
              <p className="text-sm text-stone-400">Loading your rides...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {tab === "posted" && (
                posted.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200 flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5"/>
                      </svg>
                    </div>
                    <p className="text-stone-600 font-bold mb-1">No rides posted yet</p>
                    <p className="text-sm text-stone-400 mb-6">Post a ride and start splitting fuel costs</p>
                    <button onClick={() => navigate("/dashboard/carpool/post")}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors">
                      Post a Ride
                    </button>
                  </div>
                ) : (
                  posted.map((r) => <RideCard key={r._id} ride={r} type="posted" onLeave={handleLeave} leaving={leaving}/>)
                )
              )}
              {tab === "joined" && (
                joined.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-stone-200 flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mb-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <p className="text-stone-600 font-bold mb-1">No rides joined yet</p>
                    <p className="text-sm text-stone-400 mb-6">Find a carpool and join a ride</p>
                    <button onClick={() => navigate("/dashboard/carpool")}
                      className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors">
                      Browse Rides
                    </button>
                  </div>
                ) : (
                  joined.map((r) => <RideCard key={r._id} ride={r} type="joined" onLeave={handleLeave} leaving={leaving}/>)
                )
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}