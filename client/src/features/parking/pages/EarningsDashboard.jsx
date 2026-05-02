import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ArrowLeft,
  MapPin,
  Banknote,
  ParkingSquare,
  TrendingUp,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { parkingService } from "../../../services/parkingService";
import { useAuth } from "../../../context/AuthContext";

// Generate last 6 months labels
const getLast6Months = () => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      year: d.getFullYear(),
      month: d.getMonth(),
      earnings: 0,
      bookings: 0,
    });
  }
  return months;
};

const StatCard = ({ label, value, sub, icon: Icon, accent, bg }) => (
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
    <p className={`text-2xl font-bold ${accent}`}>{value}</p>
    {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-sm">
        <p className="text-xs font-semibold text-stone-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-amber-600">৳{payload[0].value}</p>
        <p className="text-xs text-stone-400">
          {payload[1]?.value || 0} bookings
        </p>
      </div>
    );
  }
  return null;
};

const EarningsDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(getLast6Months());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await parkingService.getMySpots();
      const mySpots = res.data.spots || [];
      setSpots(mySpots);
    } catch (err) {
      console.error("Failed to fetch spots:", err);
    } finally {
      setLoading(false);
    }
  };

  // Derived stats
  const totalListings = spots.length;
  const activeListings = spots.filter((s) => s.isActive).length;
  const totalBookings = spots.reduce(
    (sum, s) => sum + (s.totalBookings || 0),
    0,
  );

  // Placeholder earnings — will be real data once booking system is built
  const totalEarnings = 0;
  const avgPerBooking =
    totalBookings > 0 ? Math.round(totalEarnings / totalBookings) : 0;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-600 rounded-md flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-stone-900 tracking-tight text-sm">
              EkSathe
            </span>
          </div>
          <span className="text-stone-300">·</span>
          <span className="text-sm font-medium text-stone-600">Earnings</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Earnings Overview
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Track your income from parking listings.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Earnings"
            value={`৳${totalEarnings.toLocaleString()}`}
            sub="All time"
            icon={Banknote}
            accent="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            label="Total Bookings"
            value={totalBookings}
            sub="All time"
            icon={Calendar}
            accent="text-blue-600"
            bg="bg-blue-50"
          />
          <StatCard
            label="Active Listings"
            value={activeListings}
            sub={`${totalListings} total`}
            icon={ParkingSquare}
            accent="text-teal-600"
            bg="bg-teal-50"
          />
          <StatCard
            label="Avg per Booking"
            value={`৳${avgPerBooking}`}
            sub="Per completed booking"
            icon={TrendingUp}
            accent="text-green-600"
            bg="bg-green-50"
          />
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-stone-800">Monthly Earnings</h3>
              <p className="text-xs text-stone-400 mt-0.5">Last 6 months</p>
            </div>
            <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded-full font-medium">
              Live data after bookings
            </span>
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "#a8a29e" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#a8a29e" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="earnings" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        index === chartData.length - 1 ? "#d97706" : "#fde68a"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {!loading && totalEarnings === 0 && (
            <p className="text-xs text-stone-400 text-center mt-2">
              Earnings will appear here once students start booking your spots.
            </p>
          )}
        </div>

        {/* Listings performance */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-stone-800">
              Listing Performance
            </h3>
            <button
              onClick={() => navigate("/dashboard/my-listings")}
              className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors"
            >
              Manage listings
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && spots.length === 0 && (
            <div className="text-center py-8">
              <ParkingSquare className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-stone-600 mb-1">
                No listings yet
              </p>
              <p className="text-xs text-stone-400 mb-4">
                Add your first parking spot to start earning.
              </p>
              <button
                onClick={() => navigate("/dashboard/create-listing")}
                className="text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors"
              >
                Add a listing →
              </button>
            </div>
          )}

          {!loading && spots.length > 0 && (
            <div className="space-y-3">
              {spots.map((spot) => (
                <div
                  key={spot._id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
                >
                  {/* Photo */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
                    {spot.photos?.length > 0 ? (
                      <img
                        src={spot.photos[0].url}
                        alt={spot.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ParkingSquare className="w-5 h-5 text-stone-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">
                      {spot.title}
                    </p>
                    <p className="text-xs text-stone-400 truncate">
                      {spot.address}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-amber-600">
                      ৳{spot.pricePerDay}/day
                    </p>
                    <p className="text-xs text-stone-400">
                      {spot.totalBookings || 0} bookings
                    </p>
                  </div>

                  {/* Status */}
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                      spot.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {spot.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EarningsDashboard;
