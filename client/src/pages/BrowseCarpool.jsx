import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

const TAKA = "\u09F3";

const UNIVERSITIES = [
  "All", "Dhaka University", "BUET", "NSU", "BRAC University",
  "IUB", "East West University", "MIST", "UIU", "AIUB",
  "Jahangirnagar University", "Stamford University",
];

function SeatDots({ total, available }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${i < (total - available) ? "bg-red-300" : "bg-teal-400"}`}/>
      ))}
    </div>
  );
}

function RouteCard({ route, onJoin, onCancel, joining, currentUserId }) {
  const departure = new Date(route.departureTime);
  const isToday = new Date().toDateString() === departure.toDateString();
  const isTomorrow = new Date(Date.now() + 86400000).toDateString() === departure.toDateString();
  const isFull = route.status === "full";
  const isCancelled = route.status === "cancelled";
  const isDriver = route.driver?._id === currentUserId || route.driver?.id === currentUserId;
  const isPassenger = route.passengers?.some((p) => (p._id || p) === currentUserId);
  const dayLabel = isToday ? "Today" : isTomorrow ? "Tomorrow"
    : departure.toLocaleDateString("en-BD", { month: "short", day: "numeric" });

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group ${isCancelled ? "border-red-100 opacity-75" : "border-gray-100"}`}>

      {/* Top bar */}
      <div className={`h-1 w-full ${
        isCancelled ? "bg-red-400" :
        isFull ? "bg-orange-400" :
        "bg-gradient-to-r from-teal-400 to-teal-500"
      }`}/>

      <div className="p-5">

        {/* Cancelled banner */}
        {isCancelled && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <p className="text-xs font-semibold text-red-600">This ride has been cancelled</p>
          </div>
        )}

        {/* Route header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-100"/>
                <div className="w-px h-4 bg-gray-200"/>
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100"/>
              </div>
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div>
                  <p className="text-sm font-bold text-gray-900 truncate">{route.origin.area}</p>
                  <p className="text-xs text-gray-400 truncate">{route.origin.name}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 truncate">{route.destination.area}</p>
                  <p className="text-xs text-gray-400 truncate">{route.destination.name}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className={`text-lg font-black ${isCancelled ? "text-gray-300 line-through" : isFull ? "text-orange-500" : "text-teal-600"}`}>
              {TAKA}{route.pricePerSeat}
            </div>
            <div className="flex flex-col items-end gap-1">
              {route.genderSafe && (
                <span className="bg-pink-50 border border-pink-200 text-pink-600 rounded-full px-2 py-0.5 text-xs font-semibold">
                  Female only
                </span>
              )}
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                isCancelled ? "bg-red-50 border-red-200 text-red-500" :
                isFull      ? "bg-orange-50 border-orange-200 text-orange-500" :
                              "bg-teal-50 border-teal-200 text-teal-600"
              }`}>
                {isCancelled ? "Cancelled" : isFull ? "Full" : "Open"}
              </span>
            </div>
          </div>
        </div>

        {/* Info strip */}
        <div className="flex items-center gap-3 py-3 border-t border-b border-gray-50 mb-4">
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-xs font-semibold text-gray-700">
              {departure.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="text-xs text-gray-400">{dayLabel}</span>
          </div>
          <div className="w-px h-4 bg-gray-200"/>
          <div className="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span className="text-xs font-semibold text-gray-700">{route.availableSeats} of {route.totalSeats}</span>
            <SeatDots total={route.totalSeats} available={route.availableSeats}/>
          </div>
        </div>

        {/* Driver */}
        {route.driver && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
              {route.driver.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">{route.driver.name}</p>
              <p className="text-xs text-gray-400">Driver</p>
            </div>
            {route.driver.trustScore != null && (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span className="text-xs font-bold text-amber-700">{route.driver.trustScore.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {route.notes && (
          <div className="bg-gray-50 rounded-xl px-3 py-2 mb-4 flex items-start gap-2">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p className="text-xs text-gray-500 italic leading-relaxed">{route.notes}</p>
          </div>
        )}

        {/* CTA */}
        {isDriver ? (
          <div className="flex flex-col gap-2">
            <div className="w-full py-3 rounded-xl bg-blue-50 border border-blue-200 text-sm font-bold text-blue-600 text-center">
              Your ride
            </div>
            {!isCancelled && (
              <button
                onClick={() => onCancel(route._id)}
                className="w-full py-2.5 rounded-xl bg-red-50 border border-red-200 text-sm font-semibold text-red-500 hover:bg-red-100 transition-all">
                Cancel Ride
              </button>
            )}
          </div>
        ) : isCancelled ? (
          <div className="w-full py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-400 text-center">
            Ride cancelled
          </div>
        ) : isPassenger ? (
          <div className="w-full py-3 rounded-xl bg-teal-50 border border-teal-200 text-sm font-bold text-teal-600 text-center flex items-center justify-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Joined
          </div>
        ) : (
          <button
            disabled={isFull || joining === route._id}
            onClick={() => onJoin(route._id)}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
              isFull
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700 active:scale-95 text-white shadow-md shadow-teal-100"
            }`}>
            {joining === route._id ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Joining...
              </span>
            ) : "Join Ride"}
          </button>
        )}

      </div>
    </div>
  );
}

export default function BrowseCarpool() {
  const navigate = useNavigate();
  const [routes, setRoutes]           = useState([]);
  const [allRoutes, setAllRoutes]     = useState([]);
  const [presets, setPresets]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [joining, setJoining]         = useState(null);
  const [error, setError]             = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");
  const [searchMode, setSearchMode]   = useState("preset");
  const [currentUserId] = useState(() => {
    try {
      const token = localStorage.getItem("eksathe_token");
      return JSON.parse(atob(token?.split(".")[1] || ""))?.id;
    } catch { return null; }
  });

  const [uniFilter, setUniFilter]           = useState("All");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [genderSafe, setGenderSafe]         = useState(false);
  const [customOrigin, setCustomOrigin]           = useState("");
  const [customDestination, setCustomDestination] = useState("");
  const [customUni, setCustomUni]                 = useState("All");

  useEffect(() => {
    api.get("/carpool/presets").then((r) => setPresets(r.data.data)).catch(() => {});
  }, []);

  const filteredPresetsByUni = uniFilter === "All"
    ? presets
    : presets.filter((r) => r.university === uniFilter);

  const loadRoutes = () => {
    setLoading(true); setError("");
    const params = {};
    if (genderSafe) params.genderSafe = "true";
    if (searchMode === "preset" && selectedPreset) params.presetRouteId = selectedPreset;
    api.get("/carpool/routes", { params })
      .then((r) => { setAllRoutes(r.data.data); setRoutes(r.data.data); })
      .catch(() => setError("Could not load rides."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRoutes(); }, [genderSafe, selectedPreset, searchMode]);

  useEffect(() => {
    if (searchMode !== "custom") return;
    let filtered = [...allRoutes];
    if (customOrigin.trim()) {
      filtered = filtered.filter((r) =>
        r.origin.name.toLowerCase().includes(customOrigin.toLowerCase()) ||
        r.origin.area.toLowerCase().includes(customOrigin.toLowerCase())
      );
    }
    if (customDestination.trim()) {
      filtered = filtered.filter((r) =>
        r.destination.name.toLowerCase().includes(customDestination.toLowerCase()) ||
        r.destination.area.toLowerCase().includes(customDestination.toLowerCase())
      );
    }
    if (customUni !== "All") {
      filtered = filtered.filter((r) =>
        r.presetRouteId && presets.find((p) => p.id === r.presetRouteId && p.university === customUni)
      );
    }
    setRoutes(filtered);
  }, [customOrigin, customDestination, customUni, allRoutes, searchMode]);

  const handleJoin = async (routeId) => {
    setJoining(routeId); setJoinSuccess(""); setError("");
    try {
      await api.post(`/carpool/routes/${routeId}/join`, {});
      setJoinSuccess("You have joined the ride!");
      loadRoutes();
      setTimeout(() => setJoinSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Could not join ride.");
    } finally {
      setJoining(null);
    }
  };

  const handleCancel = async (routeId) => {
    if (!window.confirm("Are you sure you want to cancel this ride?")) return;
    setError("");
    try {
      await api.patch(`/carpool/routes/${routeId}/cancel`);
      setCancelSuccess("Your ride has been cancelled.");
      loadRoutes();
      setTimeout(() => setCancelSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Could not cancel ride.");
    }
  };

  const clearAll = () => {
    setSelectedPreset(""); setUniFilter("All"); setGenderSafe(false);
    setCustomOrigin(""); setCustomDestination(""); setCustomUni("All");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-teal-600 pt-8 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white opacity-5"/>
          <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full bg-white opacity-5"/>
        </div>

        <div className="max-w-2xl mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-black text-white">Find a Ride</h1>
              <p className="text-teal-200 text-sm mt-0.5">Safe campus carpools across Dhaka</p>
            </div>
            <button
              onClick={() => navigate("/dashboard/carpool/post")}
              className="flex items-center gap-2 bg-white text-teal-700 text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Post Ride
            </button>
          </div>

          {/* Mode toggle */}
          <div className="flex bg-emerald-800/40 rounded-xl p-1 mb-4">
            <button onClick={() => { setSearchMode("preset"); clearAll(); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                searchMode === "preset" ? "bg-white text-teal-700 shadow-sm" : "text-teal-200 hover:text-white"
              }`}>
              University Routes
            </button>
            <button onClick={() => { setSearchMode("custom"); clearAll(); loadRoutes(); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                searchMode === "custom" ? "bg-white text-teal-700 shadow-sm" : "text-teal-200 hover:text-white"
              }`}>
              Custom Search
            </button>
          </div>

          {/* Preset search */}
          {searchMode === "preset" && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {UNIVERSITIES.map((u) => (
                  <button key={u} onClick={() => { setUniFilter(u); setSelectedPreset(""); }}
                    className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      uniFilter === u
                        ? "bg-white text-teal-700 border-white shadow-sm"
                        : "bg-transparent border-teal-400/50 text-teal-100 hover:border-white hover:text-white"
                    }`}>
                    {u}
                  </button>
                ))}
              </div>
              <div className="relative">
                <select value={selectedPreset} onChange={(e) => setSelectedPreset(e.target.value)}
                  className="w-full bg-white/95 rounded-xl border-0 px-4 py-3.5 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none shadow-lg">
                  <option value="">All routes {uniFilter !== "All" ? `to ${uniFilter}` : "across Dhaka"}</option>
                  {filteredPresetsByUni.map((r) => (
                    <option key={r.id} value={r.id}>{r.label} (~{r.estimatedKm} km)</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Custom search */}
          {searchMode === "custom" && (
            <div className="flex flex-col gap-3">
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-teal-400 ring-2 ring-teal-200"/>
                <input value={customOrigin} onChange={(e) => setCustomOrigin(e.target.value)}
                  placeholder="From — area or location (e.g. Mirpur)"
                  className="w-full bg-white/95 rounded-xl border-0 pl-8 pr-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"/>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-rose-400 ring-2 ring-rose-200"/>
                <input value={customDestination} onChange={(e) => setCustomDestination(e.target.value)}
                  placeholder="To — university or area (e.g. BUET)"
                  className="w-full bg-white/95 rounded-xl border-0 pl-8 pr-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"/>
              </div>
              <div className="relative">
                <select value={customUni} onChange={(e) => setCustomUni(e.target.value)}
                  className="w-full bg-white/95 rounded-xl border-0 px-4 py-3.5 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none shadow-lg">
                  <option value="All">All universities</option>
                  {UNIVERSITIES.filter((u) => u !== "All").map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 -mt-12 pb-8 relative z-10">

        {/* Filter bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 mb-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <div onClick={() => setGenderSafe(!genderSafe)}
              className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 cursor-pointer ${genderSafe ? "bg-pink-500" : "bg-gray-200"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${genderSafe ? "left-4" : "left-0.5"}`}/>
            </div>
            <span className="font-medium">Female only</span>
          </label>
          <div className="flex-1"/>
          <span className="text-xs text-gray-400 font-medium">
            {routes.length} ride{routes.length !== 1 ? "s" : ""}
          </span>
          {(genderSafe || selectedPreset || customOrigin || customDestination || customUni !== "All") && (
            <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-600 font-medium underline">
              Clear
            </button>
          )}
        </div>

        {/* Alerts */}
        {joinSuccess && (
          <div className="rounded-2xl bg-teal-50 border border-teal-200 px-5 py-4 text-sm text-teal-700 mb-4 flex items-center gap-3 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            {joinSuccess}
          </div>
        )}
        {cancelSuccess && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-600 mb-4 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            {cancelSuccess}
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-600 mb-4">{error}</div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin"/>
            <p className="text-sm text-gray-400 font-medium">Finding rides...</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <p className="text-gray-700 font-bold text-base mb-1">No rides found</p>
            <p className="text-sm text-gray-400 mb-6">
              {searchMode === "custom" && (customOrigin || customDestination)
                ? "Try different keywords or clear the search"
                : "Be the first to post a ride on this route"}
            </p>
            <button onClick={() => navigate("/dashboard/carpool/post")}
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-sm">
              Post a Ride
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {routes.map((r) => (
              <RouteCard
                key={r._id}
                route={r}
                onJoin={handleJoin}
                onCancel={handleCancel}
                joining={joining}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}