import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Plus, Search, X, Clock,
  Loader2, Users, ChevronDown, SlidersHorizontal,
} from "lucide-react";
import api from "../lib/api";
import { initiateCarpoolPayment } from "../services/paymentService";
import { useAuth } from "../context/AuthContext";
import CouponInput from "../components/CouponInput";

const TAKA = "\u09F3";
const ARROW = "\u2192";
const CNG_RATE_PER_KM = 25;

const UNIVERSITIES = [
  "Dhaka University", "BUET", "NSU", "BRAC University", "IUB",
  "East West University", "MIST", "UIU", "AIUB",
  "Jahangirnagar University", "Stamford University",
];

// Map university names to preset destination keywords
const UNI_KEYWORDS = {
  NSU: ["bashundhara", "nsu", "north south"],
  BUET: ["palashi", "buet"],
  "Dhaka University": ["nilkhet", "dhaka university", "du"],
  "BRAC University": ["mohakhali", "brac"],
  IUB: ["bashundhara", "iub", "independent"],
  "East West University": ["aftabnagar", "east west"],
  MIST: ["mirpur", "mist"],
  UIU: ["satarkul", "uiu", "united"],
  AIUB: ["kuratoli", "aiub"],
  "Jahangirnagar University": ["savar", "jahangirnagar"],
  "Stamford University": ["siddeswari", "stamford"],
};

const DEPARTURE_WINDOWS = [
  { label: "Morning",   value: "morning",   sub: "5am – 11am", after: "05:00", before: "11:00" },
  { label: "Afternoon", value: "afternoon", sub: "11am – 5pm",  after: "11:00", before: "17:00" },
  { label: "Evening",   value: "evening",   sub: "5pm – 11pm",  after: "17:00", before: "23:00" },
];

const MIN_SEATS_OPTIONS = [
  { label: "Any", value: "" },
  { label: "1+",  value: "1" },
  { label: "2+",  value: "2" },
  { label: "3+",  value: "3" },
];

// ── helpers ──────────────────────────────────────────────────────────────────

function calcSavings(route) {
  // Use estimatedKm if available on route, otherwise fallback
  const km = route.estimatedKm || 0;
  const cngSolo = km > 0
    ? Math.round(km * CNG_RATE_PER_KM)
    : Math.round(CNG_RATE_PER_KM * (route.totalSeats || 3));
  const savings = Math.max(0, cngSolo - route.pricePerSeat);
  return { cngSolo, savings };
}

function SeatDots({ total, available }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${i < total - available ? "bg-red-300" : "bg-teal-400"}`} />
      ))}
    </div>
  );
}

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="flex gap-3 flex-1">
          <div className="flex flex-col items-center gap-1 pt-1">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
            <div className="w-px h-6 bg-stone-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-stone-200 rounded-lg w-3/4" />
            <div className="h-3 bg-stone-100 rounded-lg w-1/2" />
            <div className="h-4 bg-stone-200 rounded-lg w-2/3 mt-2" />
            <div className="h-3 bg-stone-100 rounded-lg w-1/3" />
          </div>
        </div>
        <div className="h-6 w-12 bg-stone-200 rounded-xl" />
      </div>
      <div className="h-px bg-stone-100 mb-3" />
      <div className="flex gap-3 mb-4">
        <div className="h-3 bg-stone-100 rounded w-24" />
        <div className="h-3 bg-stone-100 rounded w-20" />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-stone-200" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-stone-200 rounded w-24" />
          <div className="h-2.5 bg-stone-100 rounded w-16" />
        </div>
      </div>
      <div className="h-10 bg-stone-100 rounded-xl" />
    </div>
  );
}

// ── Checkout modal with cost calculator + pay options ────────────────────────

function RideCheckoutModal({ route, joining, onClose, onConfirmOnline, onConfirmCash }) {
  const [couponState, setCouponState] = useState(null);
  const finalAmount = couponState?.finalAmount ?? route.pricePerSeat;
  const routeLabel = `${route.origin.area} ${ARROW} ${route.destination.area}`;

  const { cngSolo, savings } = calcSavings(route);
  const showSavings = savings > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-stone-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Join Ride</p>
            <h2 className="text-base font-black text-stone-900 mt-0.5">{routeLabel}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={!!joining}
            className="text-stone-400 hover:text-stone-700 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">

          {/* Route summary */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-100" />
                <div className="w-px h-5 bg-stone-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900 truncate">{routeLabel}</p>
                <p className="text-xs text-stone-500 mt-1">
                  {new Date(route.departureTime).toLocaleString("en-BD", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  Driver: {route.driver?.name || "Unknown"}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                {couponState && (
                  <p className="text-xs text-stone-400 line-through">{TAKA}{route.pricePerSeat}</p>
                )}
                <p className="text-xl font-black text-teal-700">{TAKA}{finalAmount}</p>
                <p className="text-xs text-stone-400">per seat</p>
              </div>
            </div>
          </div>

          {/* ── COST SPLITTING CALCULATOR ── */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
            <p className="text-xs font-bold text-green-800 uppercase tracking-wider">
              Your savings vs solo ride
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Your carpool fare</span>
                <span className="font-bold text-stone-800">{TAKA}{route.pricePerSeat}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Estimated solo CNG</span>
                <span className="font-bold text-stone-800">{TAKA}{cngSolo}</span>
              </div>
              <div className="h-px bg-green-200" />
              {showSavings ? (
                <div className="flex justify-between text-base">
                  <span className="font-bold text-green-700">You're saving</span>
                  <span className="font-black text-green-700 text-lg">{TAKA}{savings}</span>
                </div>
              ) : (
                <p className="text-xs text-stone-400 text-center">
                  Fare is similar to solo CNG for this route
                </p>
              )}
            </div>

            {showSavings && (
              <p className="text-xs text-green-600 text-center">
                Carpooling saves you {TAKA}{savings} compared to taking a CNG alone
              </p>
            )}
          </div>

          {/* Coupon */}
          <CouponInput
            amount={route.pricePerSeat}
            serviceType="carpool"
            onApply={setCouponState}
            onRemove={() => setCouponState(null)}
          />

          {/* Payment options */}
          <div className="space-y-2 pt-1">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              How would you like to pay?
            </p>

            {/* Pay Online */}
            <button
              type="button"
              onClick={() => onConfirmOnline(route, couponState?.couponCode || null)}
              disabled={!!joining}
              className="w-full py-3 rounded-xl bg-teal-600 text-white text-sm font-black hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {joining === route._id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Reserving seat...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Pay Online — {TAKA}{finalAmount}
                </>
              )}
            </button>

            {/* Pay in Cash */}
            <button
              type="button"
              onClick={() => onConfirmCash(route)}
              disabled={!!joining}
              className="w-full py-3 rounded-xl bg-stone-100 text-stone-700 text-sm font-bold hover:bg-stone-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-stone-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="12" cy="12" r="2" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
              Pay in Cash — {TAKA}{route.pricePerSeat}
            </button>

            <p className="text-xs text-stone-400 text-center">
              Cash payment: pay the driver directly when you board
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

// ── RouteCard ────────────────────────────────────────────────────────────────

function RouteCard({ route, onJoin, onLeave, onCancel, joining, leaving, currentUserId, isSuggested }) {
  const departure = new Date(route.departureTime);
  const isToday = new Date().toDateString() === departure.toDateString();
  const isTomorrow =
    new Date(Date.now() + 86400000).toDateString() === departure.toDateString();
  const isFull = route.status === "full";
  const isCancelled = route.status === "cancelled";
  const isDriver = route.driver?._id === currentUserId || route.driver?.id === currentUserId;
  const isPassenger = route.passengers?.some((p) => (p._id || p) === currentUserId);
  const dayLabel = isToday ? "Today" : isTomorrow ? "Tomorrow"
    : departure.toLocaleDateString("en-BD", { month: "short", day: "numeric" });

  // Show savings chip on card for non-drivers
  const { savings } = calcSavings(route);
  const showSavingsChip = !isDriver && !isCancelled && savings > 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
        isSuggested ? "border-teal-200 shadow-sm shadow-teal-100/50"
          : isCancelled ? "border-red-100 opacity-75"
          : "border-stone-200"
      }`}
    >
      <div className={`h-1 w-full ${
        isCancelled ? "bg-red-400" : isFull ? "bg-orange-400"
          : isSuggested ? "bg-gradient-to-r from-teal-500 to-teal-400"
          : "bg-gradient-to-r from-stone-300 to-stone-200"
      }`} />

      {/* Suggested badge */}
      {isSuggested && (
        <div className="px-5 pt-3 pb-0">
          <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
            ✦ Suggested for you
          </span>
        </div>
      )}

      <div className="p-5">
        {/* Route + price */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Timeline dots */}
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0 mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-100" />
              <div className="w-px h-5 bg-stone-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100" />
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div>
                <p className="text-sm font-bold text-stone-900 truncate">
                  {route.origin.area}
                </p>
                <p className="text-xs text-stone-400 truncate">
                  {route.origin.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900 truncate">
                  {route.destination.area}
                </p>
                <p className="text-xs text-stone-400 truncate">
                  {route.destination.name}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <p className={`text-xl font-black tracking-tight ${
              isCancelled ? "text-stone-300 line-through" : isFull ? "text-orange-500" : "text-teal-600"
            }`}>
              {TAKA}{route.pricePerSeat}
            </p>
            <p className="text-xs text-stone-400">per seat</p>
            {/* Savings chip — only for non-drivers */}
            {showSavingsChip && (
              <span className="bg-green-50 border border-green-200 text-green-700 rounded-full px-2 py-0.5 text-xs font-bold">
                Save ~{TAKA}{savings}
              </span>
            )}
            {route.genderSafe && (
              <span className="bg-pink-50 border border-pink-200 text-pink-600 rounded-full px-2 py-0.5 text-xs font-bold">
                ♀ Female only
              </span>
            )}
          </div>
        </div>

        {/* Info strip */}
        <div className="flex items-center gap-3 py-2.5 border-t border-b border-stone-50 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-bold">
              {departure.toLocaleTimeString("en-BD", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="text-stone-400">{dayLabel}</span>
          </div>
          <div className="w-px h-4 bg-stone-100" />
          <div className="flex items-center gap-1.5 text-xs text-stone-600">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-bold">{route.availableSeats} left</span>
            <SeatDots
              total={route.totalSeats}
              available={route.availableSeats}
            />
          </div>
          <div className="ml-auto">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
              isCancelled ? "bg-red-50 border-red-200 text-red-500"
                : isFull ? "bg-orange-50 border-orange-200 text-orange-500"
                : "bg-green-50 border-green-200 text-green-600"
            }`}>
              {isCancelled ? "Cancelled" : isFull ? "Full" : "Open"}
            </span>
          </div>
        </div>

        {/* Driver */}
        {route.driver && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-teal-50 flex-shrink-0 shadow-sm">
              {route.driver.photoUrl ? (
                <img
                  src={route.driver.photoUrl}
                  alt={route.driver.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                  {route.driver.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-stone-800">
                {route.driver.name}
              </p>
              <p className="text-xs text-stone-400">Driver</p>
            </div>
            {route.driver.trustScore != null && (
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-xl px-2.5 py-1">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="#f59e0b"
                  stroke="none"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="text-xs font-black text-amber-700">
                  {route.driver.trustScore}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {route.notes && (
          <div className="bg-stone-50 rounded-xl px-3 py-2 mb-4 flex items-start gap-2">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#a8a29e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 mt-0.5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-xs text-stone-500 italic">{route.notes}</p>
          </div>
        )}

        {/* CTA */}
        {isDriver ? (
          <div className="space-y-2">
            <div className="w-full py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-sm font-bold text-blue-600 text-center">
              Your ride
            </div>
            {!isCancelled && (
              <button
                onClick={() => onCancel(route._id)}
                className="w-full py-2 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-500 hover:bg-red-100 transition-all"
              >
                Cancel Ride
              </button>
            )}
          </div>
        ) : isCancelled ? (
          <div className="w-full py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-semibold text-stone-400 text-center">
            Ride cancelled
          </div>
        ) : isPassenger ? (
          <div className="space-y-2">
            <div className="w-full py-2.5 rounded-xl bg-teal-50 border border-teal-200 text-sm font-bold text-teal-600 text-center flex items-center justify-center gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Joined
            </div>
            <button onClick={() => onLeave(route._id)} disabled={leaving === route._id}
              className="w-full py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-bold text-stone-500 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all disabled:opacity-50">
              {leaving === route._id ? "Leaving..." : "Leave Ride"}
            </button>
          </div>
        ) : (
          <button
            disabled={isFull || joining === route._id}
            onClick={() => onJoin(route)}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
              isFull ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700 active:scale-95 text-white shadow-sm"
            }`}
          >
            {joining === route._id ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Joining...
              </span>
            ) : (
              "Join Ride"
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── BrowseCarpool page ───────────────────────────────────────────────────────

export default function BrowseCarpool() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allRoutes, setAllRoutes] = useState([]);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);
  const [leaving, setLeaving] = useState(null);
  const [error, setError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");
  const [leaveSuccess, setLeaveSuccess] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [checkoutRoute, setCheckoutRoute] = useState(null);

  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [genderSafe, setGenderSafe] = useState(false);
  const [uniFilter, setUniFilter] = useState("All");
  const [maxPrice, setMaxPrice] = useState(500);
  const [minSeats, setMinSeats] = useState("");
  const [departureWindow, setDepartureWindow] = useState("");

  const fromDebounceRef = useRef(null);
  const toDebounceRef = useRef(null);

  const [currentUserId] = useState(() => {
    try {
      const token = localStorage.getItem("eksathe_token");
      return JSON.parse(atob(token?.split(".")[1] || ""))?.id;
    } catch {
      return null;
    }
  });

  // Get user's university name from their profile
  const userUniName = user?.university
    ? UNIVERSITIES.find((u) =>
        u.toLowerCase().includes(user.university?.toLowerCase?.()) ||
        user.university?.toLowerCase?.().includes(u.toLowerCase()))
    : null;

  useEffect(() => {
    api
      .get("/carpool/presets")
      .then((r) => setPresets(r.data.data))
      .catch(() => {});
    loadRoutes();
  }, []);

  useEffect(() => { loadRoutes(); }, [genderSafe, minSeats, departureWindow, maxPrice]);

  useEffect(() => {
    if (fromDebounceRef.current) clearTimeout(fromDebounceRef.current);
    fromDebounceRef.current = setTimeout(() => loadRoutes(), 300);
    return () => clearTimeout(fromDebounceRef.current);
  }, [fromText]);

  useEffect(() => {
    if (toDebounceRef.current) clearTimeout(toDebounceRef.current);
    toDebounceRef.current = setTimeout(() => loadRoutes(), 300);
    return () => clearTimeout(toDebounceRef.current);
  }, [toText]);

  const buildApiParams = () => {
    const params = {};
    if (genderSafe) params.genderSafe = "true";
    if (maxPrice < 500) params.maxPrice = maxPrice;
    if (minSeats) params.minSeats = minSeats;
    if (departureWindow) {
      const win = DEPARTURE_WINDOWS.find((w) => w.value === departureWindow);
      if (win) {
        const today = new Date().toISOString().split("T")[0];
        params.departureAfter = `${today}T${win.after}:00`;
        params.departureBefore = `${today}T${win.before}:00`;
      }
    }
    return params;
  };

  const loadRoutes = () => {
    setLoading(true);
    setError("");
    const params = buildApiParams();
    api.get("/carpool/routes", { params })
      .then((r) => setAllRoutes(r.data.data || []))
      .catch(() => setError("Could not load rides."))
      .finally(() => setLoading(false));
  };

  const filteredRoutes = allRoutes.filter((r) => {
    const from = fromText.trim().toLowerCase();
    const to = toText.trim().toLowerCase();
    const matchFrom = !from || r.origin.name.toLowerCase().includes(from) || r.origin.area.toLowerCase().includes(from);
    const matchTo = !to || r.destination.name.toLowerCase().includes(to) || r.destination.area.toLowerCase().includes(to);
    const matchUni = uniFilter === "All" || (r.presetRouteId && presets.find((p) => p.id === r.presetRouteId && p.university === uniFilter));
    return matchFrom && matchTo && matchUni;
  });

  // Suggested rides — match user's university destination keywords
  const suggestedRoutes = userUniName
    ? filteredRoutes.filter((r) => {
        const keywords = UNI_KEYWORDS[userUniName] || [];
        const dest = (
          r.destination.name +
          " " +
          r.destination.area
        ).toLowerCase();
        return keywords.some((kw) => dest.includes(kw));
      })
    : [];

  // Other rides — everything not in suggested
  const suggestedIds = new Set(suggestedRoutes.map((r) => r._id));
  const otherRoutes = filteredRoutes.filter((r) => !suggestedIds.has(r._id));
  const hasActiveFilters = fromText || toText || genderSafe || uniFilter !== "All" || maxPrice < 500 || minSeats || departureWindow;

  const clearAll = () => {
    setFromText(""); setToText(""); setGenderSafe(false);
    setUniFilter("All"); setMaxPrice(500); setMinSeats(""); setDepartureWindow("");
  };

  // Open checkout modal
  const handleJoin = (route) => {
    setCheckoutRoute(route);
    setJoinSuccess("");
    setError("");
  };

  // Pay Online — SSLCommerz
  const handleConfirmOnline = async (route, couponCode = null) => {
    const routeId = route._id;
    let seatReserved = false;
    setJoining(routeId);
    setJoinSuccess("");
    setError("");
    try {
      await api.post(`/carpool/routes/${routeId}/join`, {});
      seatReserved = true;
      setJoinSuccess("Seat reserved! Redirecting to payment...");
      const payRes = await initiateCarpoolPayment(routeId, couponCode);
      if (payRes.url) {
        window.location.href = payRes.url;
        return;
      }
      throw new Error("Payment could not be started.");
    } catch (err) {
      if (seatReserved) {
        try { await api.delete(`/carpool/routes/${routeId}/leave`); } catch { /* rollback */ }
      }
      setJoinSuccess("");
      setError(err.message || "Could not join ride.");
      setCheckoutRoute(null);
      loadRoutes();
    } finally {
      setJoining(null);
    }
  };

  // Pay in Cash — just join, no payment redirect
  const handleConfirmCash = async (route) => {
    const routeId = route._id;
    setJoining(routeId);
    setJoinSuccess("");
    setError("");
    try {
      await api.post(`/carpool/routes/${routeId}/join`, {});
      setCheckoutRoute(null);
      setJoinSuccess("You have joined the ride! Pay the driver in cash when you board.");
      loadRoutes();
      setTimeout(() => setJoinSuccess(""), 5000);
    } catch (err) {
      setError(err.message || "Could not join ride.");
      setCheckoutRoute(null);
    } finally {
      setJoining(null);
    }
  };

  const handleLeave = async (routeId) => {
    if (!window.confirm("Leave this ride?")) return;
    setLeaving(routeId);
    setError("");
    try {
      await api.delete(`/carpool/routes/${routeId}/leave`);
      setLeaveSuccess("You have left the ride.");
      loadRoutes();
      setTimeout(() => setLeaveSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Could not leave ride.");
    } finally {
      setLeaving(null);
    }
  };

  const handleCancel = async (routeId) => {
    if (!window.confirm("Cancel this ride?")) return;
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
    setFromText("");
    setToText("");
    setGenderSafe(false);
    setUniFilter("All");
  };

  return (
    <div className="min-h-screen dashboard-bg">
      <header className="bg-white/90 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-stone-900 text-sm">EkSathe</span>
          </div>
          <span className="text-stone-300">·</span>
          <span className="text-sm font-semibold text-stone-600">
            Carpooling
          </span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => navigate("/dashboard/carpool/my-rides")}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors px-2 py-1.5"
            >
              My Rides
            </button>
            <button
              onClick={() => navigate("/dashboard/carpool/post")}
              className="flex items-center gap-1.5 bg-teal-600 text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Post Ride
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 mb-4"
        >
          <div className="space-y-2 mb-3">
            <div className="relative flex items-center">
              <div className="absolute left-3 w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-100 flex-shrink-0" />
              <input value={fromText} onChange={(e) => setFromText(e.target.value)} placeholder="From — area or location"
                className="w-full pl-8 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 hover:border-stone-300 transition-colors"
              />
              {fromText && <button onClick={() => setFromText("")} className="absolute right-3 text-stone-400 hover:text-stone-600"><X className="w-3.5 h-3.5" /></button>}
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100 flex-shrink-0" />
              <input value={toText} onChange={(e) => setToText(e.target.value)} placeholder="To — university or destination"
                className="w-full pl-8 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 hover:border-stone-300 transition-colors"
              />
              {toText && <button onClick={() => setToText("")} className="absolute right-3 text-stone-400 hover:text-stone-600"><X className="w-3.5 h-3.5" /></button>}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => setGenderSafe(!genderSafe)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${genderSafe ? "bg-pink-50 border-pink-300 text-pink-600" : "bg-stone-50 border-stone-200 text-stone-500 hover:border-stone-300"}`}>
              <span>♀</span> Female only
            </button>
            <div className="relative flex-1">
              <select value={uniFilter} onChange={(e) => setUniFilter(e.target.value)}
                className="w-full appearance-none text-xs font-semibold px-3 py-2 pr-7 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 focus:outline-none focus:border-teal-600 hover:border-stone-300 transition-colors">
                <option value="All">All universities</option>
                {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
            </div>
            <button onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition-all ${
                showFilters || maxPrice < 500 || minSeats || departureWindow
                  ? "bg-teal-50 border-teal-300 text-teal-700"
                  : "bg-stone-50 border-stone-200 text-stone-500 hover:border-stone-300"
              }`}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              More
              {(maxPrice < 500 || minSeats || departureWindow) && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
            </button>
            {hasActiveFilters && <button onClick={clearAll} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors px-2 py-2">Clear</button>}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: "easeInOut" }} className="overflow-hidden">
                <div className="border-t border-stone-100 pt-3 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Max Price per Seat</p>
                      <span className="text-xs font-black text-teal-600">{maxPrice >= 500 ? "Any" : `৳${maxPrice}`}</span>
                    </div>
                    <input type="range" min={0} max={500} step={10} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-teal-600" />
                    <div className="flex justify-between text-xs text-stone-400 mt-1"><span>৳0</span><span>৳500+</span></div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Minimum Available Seats</p>
                    <div className="flex gap-2">
                      {MIN_SEATS_OPTIONS.map((opt) => (
                        <button key={opt.value} onClick={() => setMinSeats(opt.value)}
                          className={`flex-1 text-xs font-bold py-2 rounded-xl border transition-all ${minSeats === opt.value ? "bg-teal-600 border-teal-600 text-white" : "bg-stone-50 border-stone-200 text-stone-600 hover:border-teal-400 hover:text-teal-600"}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Departure Time</p>
                    <div className="flex gap-2">
                      {DEPARTURE_WINDOWS.map((win) => (
                        <button key={win.value} onClick={() => setDepartureWindow(departureWindow === win.value ? "" : win.value)}
                          className={`flex-1 py-2 rounded-xl border transition-all ${departureWindow === win.value ? "bg-teal-600 border-teal-600 text-white" : "bg-stone-50 border-stone-200 text-stone-600 hover:border-teal-400 hover:text-teal-600"}`}>
                          <p className="text-xs font-bold">{win.label}</p>
                          <p className={`text-xs mt-0.5 ${departureWindow === win.value ? "text-teal-100" : "text-stone-400"}`}>{win.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && (
            <p className="text-xs text-stone-400 mt-2.5">
              {filteredRoutes.length} ride
              {filteredRoutes.length !== 1 ? "s" : ""} available
              {userUniName && suggestedRoutes.length > 0 && (
                <span className="text-teal-600 font-semibold"> · {suggestedRoutes.length} near {userUniName}</span>
              )}
            </p>
          )}
        </motion.div>

        <AnimatePresence>
          {joinSuccess && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl bg-teal-50 border border-teal-200 px-4 py-3 text-sm text-teal-700 mb-4 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              {joinSuccess}
            </motion.div>
          )}
          {leaveSuccess && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl bg-stone-50 border border-stone-200 px-4 py-3 text-sm text-stone-600 mb-4">{leaveSuccess}</motion.div>
          )}
          {cancelSuccess && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">{cancelSuccess}</motion.div>
          )}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">{error}</motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <SkeletonCard key={i} />)}</div>
        ) : filteredRoutes.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-stone-200 py-16 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-stone-300" />
            </div>
            <p className="text-stone-700 font-bold text-base mb-1">No rides found</p>
            <p className="text-sm text-stone-400 mb-6">{hasActiveFilters ? "Try clearing your filters" : "Be the first to post a ride on this route"}</p>
            <div className="flex gap-2 justify-center">
              {hasActiveFilters && <button onClick={clearAll} className="bg-stone-100 text-stone-700 text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-stone-200 transition-colors">Clear filters</button>}
              <button onClick={() => navigate("/dashboard/carpool/post")} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors">Post a Ride</button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Suggested for you */}
            {suggestedRoutes.length > 0 && !hasActiveFilters && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                    Suggested for you
                  </p>
                  <div className="flex-1 h-px bg-stone-100" />
                  <span className="text-xs text-teal-600 font-semibold">
                    {userUniName}
                  </span>
                </div>
                <div className="space-y-3">
                  {suggestedRoutes.map((r) => (
                    <RouteCard
                      key={r._id}
                      route={r}
                      isSuggested
                      onJoin={handleJoin}
                      onLeave={handleLeave}
                      onCancel={handleCancel}
                      joining={joining}
                      leaving={leaving}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            )}
            {(otherRoutes.length > 0 || hasActiveFilters) && (
              <div>
                {suggestedRoutes.length > 0 && !hasActiveFilters && (
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                      Other rides
                    </p>
                    <div className="flex-1 h-px bg-stone-100" />
                  </div>
                )}
                <div className="space-y-3">
                  {(hasActiveFilters ? filteredRoutes : otherRoutes).map(
                    (r) => (
                      <RouteCard
                        key={r._id}
                        route={r}
                        isSuggested={false}
                        onJoin={handleJoin}
                        onLeave={handleLeave}
                        onCancel={handleCancel}
                        joining={joining}
                        leaving={leaving}
                        currentUserId={currentUserId}
                      />
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {checkoutRoute && (
          <RideCheckoutModal
            route={checkoutRoute}
            joining={joining}
            onClose={() => setCheckoutRoute(null)}
            onConfirmOnline={handleConfirmOnline}
            onConfirmCash={handleConfirmCash}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
