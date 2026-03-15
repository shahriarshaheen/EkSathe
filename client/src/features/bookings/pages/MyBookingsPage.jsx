import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Clock, MapPin, XCircle } from "lucide-react";
import { getMyBookings, cancelBooking } from "../../../services/bookingService";
import DashboardLayout from "../../../components/ui/DashboardLayout";
import { Home, Car, Shield, Bell } from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Overview", icon: Home },
  { path: "/dashboard/parking", label: "Find Parking", icon: MapPin },
  { path: "/dashboard/bookings", label: "My Bookings", icon: CalendarDays },
  { path: "/dashboard/carpool", label: "Carpooling", icon: Car, soon: true },
  { path: "/dashboard/sos", label: "SOS & Safety", icon: Shield, soon: true },
  { path: "/dashboard/report-incident", label: "Report Incident", icon: Shield },
  { path: "/dashboard/notifications", label: "Notifications", icon: Bell, soon: true },
];

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-teal-100 text-teal-700",
  cancelled: "bg-stone-100 text-stone-500",
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyBookings();
        setBookings(res.data);
      } catch {
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await cancelBooking(id, "student");
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, status: "cancelled", cancelledBy: "student" } : b
        )
      );
      toast.success("Booking cancelled");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-teal-50 rounded-lg">
            <CalendarDays className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-800">My Bookings</h1>
            <p className="text-sm text-stone-500">All your parking reservations</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-stone-400 text-sm">
            <div className="w-4 h-4 border-2 border-stone-300 border-t-transparent rounded-full animate-spin" />
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
            <CalendarDays className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm">No bookings yet.</p>
            <p className="text-stone-400 text-xs mt-1">Find a parking spot to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                      ${STATUS_STYLES[booking.status]}`}>
                      {booking.status}
                    </span>
                    <span className="text-xs text-stone-400">
                      #{booking._id.slice(-6).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-stone-400" />
                      {booking.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {booking.startTime} — {booking.endTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      ৳{booking.totalPrice}
                    </span>
                  </div>
                </div>

                {booking.status !== "cancelled" && (
                  <button
                    onClick={() => handleCancel(booking._id)}
                    disabled={cancelling === booking._id}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-500
                      hover:text-red-600 border border-red-200 hover:border-red-300
                      px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {cancelling === booking._id ? "Cancelling..." : "Cancel"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}