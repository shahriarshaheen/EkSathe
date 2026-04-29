import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  MapPin,
  XCircle,
  Users,
  Home,
  ParkingSquare,
  Bell,
  Banknote,
  MessageCircle,
} from "lucide-react";
import {
  getHomeownerBookings,
  cancelBooking,
} from "../../../services/bookingService";
import DashboardLayout from "../../../components/ui/DashboardLayout";
import ChatModal from "../../../components/ChatModal";
import api from "../../../lib/api";

// Homeowner-specific nav — no carpooling, no report incident
const navItems = [
  { path: "/dashboard", label: "Overview", icon: Home },
  { path: "/dashboard/my-listings", label: "My Listings", icon: ParkingSquare },
  { path: "/dashboard/homeowner-bookings", label: "Bookings", icon: Users },
  { path: "/dashboard/earnings", label: "Earnings", icon: Banknote },
  {
    path: "/dashboard/notifications",
    label: "Notifications",
    icon: Bell,
    soon: true,
  },
];

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-teal-100 text-teal-700",
  cancelled: "bg-stone-100 text-stone-500",
};

export default function HomeownerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [chatModal, setChatModal] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const bookRes = await getHomeownerBookings();
        const bookData = bookRes.data || [];
        setBookings(bookData);

        const active = bookData.filter((b) => b.status !== "cancelled");
        if (active.length > 0) {
          try {
            const unreadRes = await api.post("/messages/unread/bulk", {
              contexts: active.map((b) => ({
                contextType: "parking",
                contextId: b._id,
              })),
            });
            setUnreadCounts(unreadRes.data.data || {});
          } catch {
            /* silent */
          }
        }
      } catch {
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await cancelBooking(id, "homeowner");
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)),
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
          <div className="p-2 bg-amber-50 rounded-xl">
            <Users className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-800">Bookings</h1>
            <p className="text-sm text-stone-500">
              Students who have booked your spots
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-stone-400 text-sm">
            <div className="w-4 h-4 border-2 border-stone-300 border-t-transparent rounded-full animate-spin" />
            Loading bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
            <Users className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm font-semibold">
              No bookings yet.
            </p>
            <p className="text-stone-400 text-xs mt-1">
              Once students book your spot, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const student = booking.student;
              const canChat = booking.status !== "cancelled";
              const unread = unreadCounts[`parking_${booking._id}`] || 0;

              return (
                <div
                  key={booking._id}
                  className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Status + ID */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[booking.status]}`}
                        >
                          {booking.status}
                        </span>
                        <span className="text-xs text-stone-400">
                          #{booking._id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      {/* Date / time / price */}
                      <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-stone-400" />
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          {booking.startTime} — {booking.endTime}
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-teal-600">
                          <MapPin className="w-3.5 h-3.5" />৳
                          {booking.totalPrice}
                        </span>
                      </div>

                      {/* Student info */}
                      {student && (
                        <div className="flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-xl px-3 py-2 w-fit">
                          <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {student.photoUrl ? (
                              <img
                                src={student.photoUrl}
                                className="w-full h-full object-cover"
                                alt={student.name}
                              />
                            ) : (
                              <span className="text-xs font-bold text-teal-700">
                                {student.name?.[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-700">
                              {student.name}
                            </p>
                            <p className="text-xs text-stone-400">
                              Student · Trust {student.trustScore}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      {canChat && student && (
                        <button
                          onClick={() => setChatModal({ booking, student })}
                          className="flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-stone-50 border border-stone-200 px-3 py-2 rounded-xl hover:bg-stone-100 transition-colors relative"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Chat
                          {unread > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">
                              {unread > 9 ? "9+" : unread}
                            </span>
                          )}
                        </button>
                      )}

                      {booking.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancelling === booking._id}
                          className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {cancelling === booking._id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {chatModal && (
        <ChatModal
          contextType="parking"
          contextId={chatModal.booking._id}
          title={`Booking #${chatModal.booking._id.slice(-6).toUpperCase()}`}
          participants={[
            {
              name: chatModal.student?.name,
              photoUrl: chatModal.student?.photoUrl,
            },
          ]}
          onClose={() => setChatModal(null)}
        />
      )}
    </DashboardLayout>
  );
}