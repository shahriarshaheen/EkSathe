import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Home,
  MapPin,
  Car,
  Shield,
  Bell,
  TrendingUp,
  Users,
  ArrowUpRight,
} from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

const navItems = [
  { path: "/dashboard", label: "Overview", icon: Home },
  { path: "/dashboard/parking", label: "Find Parking", icon: MapPin },
  { path: "/dashboard/carpool", label: "Carpooling", icon: Car },
  { path: "/dashboard/sos", label: "SOS & Safety", icon: Shield },
  {
    path: "/dashboard/notifications",
    label: "Notifications",
    icon: Bell,
    soon: true,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35 },
  }),
};

const StarRow = ({ count, total, score }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-stone-500 w-4 text-right">{score}</span>
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="h-full bg-amber-400 rounded-full"
        />
      </div>
      <span className="text-xs text-stone-400 w-6 text-right">{count}</span>
    </div>
  );
};

const RatingCard = ({ rating }) => {
  const stars = rating.score;
  const date = new Date(rating.createdAt).toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const roleLabel =
    {
      driver: "as Driver",
      passenger: "as Passenger",
      homeowner: "as Homeowner",
      tenant: "as Tenant",
    }[rating.ratedRole] || "";

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl border border-stone-200 p-4 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start gap-3">
        {/* Reviewer avatar */}
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
          {rating.rater?.photoUrl ? (
            <img
              src={rating.rater.photoUrl}
              alt={rating.rater.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-teal-600">
              {rating.rater?.name?.[0]?.toUpperCase() || "?"}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div>
              <p className="text-sm font-bold text-stone-800">
                {rating.rater?.name || "Anonymous"}
              </p>
              <p className="text-xs text-stone-400">
                {roleLabel} · {date}
              </p>
            </div>
            {/* Stars */}
            <div className="flex gap-0.5 flex-shrink-0">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${s <= stars ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-200"}`}
                />
              ))}
            </div>
          </div>

          {/* Context badge */}
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              rating.contextType === "carpool"
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "bg-amber-50 border-amber-200 text-amber-600"
            }`}
          >
            {rating.contextType === "carpool" ? "Carpool" : "Parking"}
          </span>

          {/* Comment */}
          {rating.comment && (
            <p className="text-sm text-stone-600 mt-2 leading-relaxed italic">
              "{rating.comment}"
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function MyRatingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    ratings: [],
    average: null,
    total: 0,
    breakdown: {},
  });
  const [given, setGiven] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("received");
  const [filter, setFilter] = useState("all"); // all | carpool | parking

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [recRes, givRes] = await Promise.all([
          api.get("/ratings/received"),
          api.get("/ratings/given"),
        ]);
        setData(recRes.data.data);
        setGiven(givRes.data.data);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const displayedReceived =
    filter === "all"
      ? data.ratings
      : data.ratings.filter((r) => r.contextType === filter);

  const displayedGiven =
    filter === "all" ? given : given.filter((r) => r.contextType === filter);

  const avgNum = data.average ? parseFloat(data.average) : 0;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="min-h-screen dashboard-bg">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-stone-900">My Ratings</h1>
            <p className="text-stone-400 text-sm mt-1">
              Your reputation across carpool rides and parking bookings
            </p>
          </motion.div>

          {/* Summary card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="bg-white rounded-2xl border border-stone-200 p-6 mb-6"
          >
            <div className="flex items-center gap-6">
              {/* Big average */}
              <div className="flex flex-col items-center flex-shrink-0">
                <p className="text-5xl font-black text-stone-900">
                  {data.average || "—"}
                </p>
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(avgNum) ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-200"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-stone-400 mt-1">
                  {data.total} rating{data.total !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Breakdown bars */}
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((s) => (
                  <StarRow
                    key={s}
                    score={s}
                    count={data.breakdown[s] || 0}
                    total={data.total}
                  />
                ))}
              </div>
            </div>

            {/* Trust score link */}
            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span className="text-sm text-stone-600">Trust Score</span>
                <span className="text-sm font-bold text-teal-600">
                  {user?.trustScore ?? 0}/100
                </span>
              </div>
              <button
                onClick={() => navigate("/dashboard/profile")}
                className="flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-teal-600 transition-colors"
              >
                View profile <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>

          {/* Received / Given tabs */}
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-4">
            {[
              ["received", "Received"],
              ["given", "Given"],
            ].map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  tab === t
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                {label}{" "}
                {t === "received" ? `(${data.total})` : `(${given.length})`}
              </button>
            ))}
          </div>

          {/* Context filter */}
          <div className="flex gap-2 mb-5">
            {[
              ["all", "All"],
              ["carpool", "Carpool"],
              ["parking", "Parking"],
            ].map(([f, label]) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                  filter === f
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-stone-500 border-stone-200 hover:border-teal-400 hover:text-teal-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
              <p className="text-sm text-stone-400">Loading ratings...</p>
            </div>
          ) : tab === "received" ? (
            displayedReceived.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                <Star className="w-10 h-10 text-stone-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-stone-500 mb-1">
                  No ratings yet
                </p>
                <p className="text-xs text-stone-400">
                  Complete carpool rides or parking bookings to receive ratings.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {displayedReceived.map((r, i) => (
                  <RatingCard key={r._id} rating={r} />
                ))}
              </div>
            )
          ) : displayedGiven.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
              <Users className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-stone-500 mb-1">
                No ratings given yet
              </p>
              <p className="text-xs text-stone-400">
                Rate drivers, passengers, and homeowners after your rides and
                bookings.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {displayedGiven.map((r, i) => (
                <motion.div
                  key={r._id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  className="bg-white rounded-2xl border border-stone-200 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center flex-shrink-0">
                      {r.rated?.photoUrl ? (
                        <img
                          src={r.rated.photoUrl}
                          alt={r.rated.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-stone-500">
                          {r.rated?.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-800">
                        {r.rated?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-stone-400 capitalize">
                        {r.ratedRole} ·{" "}
                        {new Date(r.createdAt).toLocaleDateString("en-BD", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      {r.comment && (
                        <p className="text-xs text-stone-500 mt-1 italic">
                          "{r.comment}"
                        </p>
                      )}
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s <= r.score ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
