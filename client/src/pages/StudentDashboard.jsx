import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
const tealIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
});

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
  { path: "/dashboard/notifications", label: "Notifications", icon: Bell },
];

// slide id "carpool", "parking", "safety" get lottie animations instead of emoji
const STUDENT_SLIDES = [
  {
    id: "parking",
    eyebrow: "Parking near you",
    title: "Find spots near your campus",
    sub: "From ৳40/day · Verified hosts · Book instantly",
    cta: "Find a spot",
    route: "/dashboard/parking",
    bg: "from-teal-700 to-teal-900",
    icon: null,
  },
  {
    id: "carpool",
    eyebrow: "Daily commute",
    title: "Students going your route — seats available",
    sub: "Split fuel costs · Verified drivers · Safe rides",
    cta: "Browse carpools",
    route: "/dashboard/carpool",
    bg: "from-stone-800 to-stone-950",
    icon: null,
  },
  {
    id: "safety",
    eyebrow: "Campus safety",
    title: "SOS ready — one tap sends your location",
    sub: "Add emergency contacts · Protect every commute",
    cta: "Set up now",
    route: "/dashboard/sos",
    bg: "from-blue-800 to-blue-950",
    icon: null,
  },
];

// ── PromoBanner ───────────────────────────────────────────────
const PromoBanner = ({ slides }) => {
  const navigate = useNavigate();
  const [cur, setCur] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timerRef = useRef(null);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCur((c) => (c + 1) % slides.length);
        setAnimating(false);
      }, 200);
    }, 4200);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (n) => {
    setAnimating(true);
    setTimeout(() => {
      setCur((n + slides.length) % slides.length);
      setAnimating(false);
    }, 150);
    startTimer();
  };

  const s = slides[cur];
  const isCarpool = s.id === "carpool";
  const isParking = s.id === "parking";
  const isSafety = s.id === "safety";

  return (
    <div
      className={`relative rounded-2xl overflow-hidden mb-6 select-none transition-all duration-300 ${
        isCarpool || isParking || isSafety ? "h-[160px]" : "h-[130px]"
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${s.bg} transition-all duration-500`}
      />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div
        className={`relative h-full flex items-center px-6 transition-opacity duration-200 ${
          animating ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">
            {s.eyebrow}
          </p>
          <p className="text-base font-bold text-white leading-snug mb-2 pr-4">
            {s.title}
          </p>
          <p className="text-xs text-white/50 mb-3 hidden sm:block">{s.sub}</p>
          <button
            onClick={() => navigate(s.route)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 px-3 py-1.5 rounded-full transition-colors"
          >
            {s.cta}
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Right side: lottie on carpool/parking/safety slides, emoji on others */}
        <div className="flex-shrink-0 flex items-center justify-center ml-2">
          {isCarpool ? (
            <div
              className="hidden sm:block"
              style={{ width: 160, height: 110, marginRight: -8 }}
            >
              <DotLottieReact
                src="/carpool.lottie"
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          ) : isParking ? (
            <div
              className="hidden sm:block"
              style={{ width: 160, height: 120, marginRight: -8 }}
            >
              <DotLottieReact
                src="/map-routing.lottie"
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          ) : isSafety ? (
            <div
              className="hidden sm:block"
              style={{ width: 130, height: 120, marginRight: -8 }}
            >
              <DotLottieReact
                src="/error.lottie"
                loop
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          ) : (
            <div className="text-4xl opacity-30 mr-2 hidden sm:block">
              {s.icon}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => goTo(cur - 1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <ChevronLeft className="w-3 h-3 text-white" />
      </button>
      <button
        onClick={() => goTo(cur + 1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
      >
        <ChevronRight className="w-3 h-3 text-white" />
      </button>

      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === cur
                ? "w-4 h-1.5 bg-white"
                : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ── MiniMap ───────────────────────────────────────────────────
const MiniMap = ({ onExpand }) => {
  const defaultCenter = [23.8103, 90.4125];
  return (
    <div
      className="rounded-2xl overflow-hidden border border-stone-200 mb-6 relative"
      style={{ height: 160 }}
    >
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <Marker position={defaultCenter} icon={tealIcon}>
          <Popup>
            <span style={{ fontSize: 12, fontWeight: 500 }}>
              Your campus area
            </span>
          </Popup>
        </Marker>
      </MapContainer>
      <div className="absolute top-2.5 left-2.5 z-[999] bg-white/90 backdrop-blur-sm border border-stone-200 rounded-lg px-2.5 py-1 shadow-sm">
        <p className="text-xs font-semibold text-stone-700">Nearby parking</p>
      </div>
      <button
        onClick={onExpand}
        className="absolute bottom-2.5 right-2.5 z-[999] bg-white/90 backdrop-blur-sm border border-stone-200 rounded-lg px-2.5 py-1 shadow-sm text-xs font-semibold text-teal-700 hover:bg-teal-50 transition-colors flex items-center gap-1"
      >
        View full map <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────
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

const QuickCard = ({
  icon: Icon,
  title,
  desc,
  badge,
  color,
  onClick,
  lottie,
  lottieFile,
}) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl border border-stone-200 p-5 flex gap-4 items-start hover:border-stone-300 hover:shadow-sm transition-all ${
      onClick ? "cursor-pointer" : "cursor-default"
    }`}
  >
    {lottie ? (
      // Tiny lottie thumbnail on the quick card
      <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
        <DotLottieReact
          src={lottieFile || "/carpool.lottie"}
          loop
          autoplay
          style={{ width: 56, height: 56, marginTop: -8, marginLeft: -8 }}
        />
      </div>
    ) : (
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
    )}
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

// ── Main Dashboard ────────────────────────────────────────────
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Good morning, {firstName}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Here's what's happening around campus today.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        {/* Promo Banner — carpool slide shows lottie */}
        <PromoBanner slides={STUDENT_SLIDES} />

        <MiniMap onExpand={() => navigate("/dashboard/parking")} />

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
              lottie
              lottieFile="/map-routing.lottie"
            />
            {/* Carpool card uses lottie thumbnail */}
            <QuickCard
              icon={Car}
              title="Join a Carpool"
              desc="Share your daily commute and split fuel costs with others."
              color="bg-blue-50 text-blue-600"
              onClick={() => navigate("/dashboard/carpool")}
              lottie
            />
            <QuickCard
              icon={Navigation}
              title="Post a Ride"
              desc="Offer your seat and help fellow students get to campus."
              color="bg-violet-50 text-violet-600"
              onClick={() => navigate("/dashboard/carpool/post")}
              lottie
              lottieFile="/man-waiting-car.lottie"
            />
            <QuickCard
              icon={Shield}
              title="SOS & Safety"
              desc="One tap emergency alert — sends your location to trusted contacts."
              color="bg-red-50 text-red-500"
              onClick={() => navigate("/dashboard/sos")}
              lottie
              lottieFile="/error.lottie"
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
            <ChevronRight className="w-4 h-4 text-teal-600" />
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