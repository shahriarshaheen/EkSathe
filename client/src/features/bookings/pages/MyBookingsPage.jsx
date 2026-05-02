import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  MapPin,
  XCircle,
  Star,
  MessageCircle,
} from "lucide-react";
import { getMyBookings, cancelBooking } from "../../../services/bookingService";
import DashboardLayout from "../../../components/ui/DashboardLayout";
import RatingModal from "../../../components/RatingModal";
import ChatModal from "../../../components/ChatModal";
import { Home, Car, Shield, Bell } from "lucide-react";
import api from "../../../lib/api";
import AnnouncementBanner from "../../../components/AnnouncementBanner";

const navItems = [
  { path: "/dashboard", label: "Overview", icon: Home },
  { path: "/dashboard/parking", label: "Find Parking", icon: MapPin },
  { path: "/dashboard/bookings", label: "My Bookings", icon: CalendarDays },
  { path: "/dashboard/carpool", label: "Carpooling", icon: Car },
  { path: "/dashboard/sos", label: "SOS & Safety", icon: Shield },
  {
    path: "/dashboard/report-incident",
    label: "Report Incident",
    icon: Shield,
  },
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

const isRateable = (booking) => {
  if (booking.status !== "confirmed") return false;
  const bookingEnd = new Date(`${booking.date}T${booking.endTime}`);
  return bookingEnd < new Date();
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [ratingModal, setRatingModal] = useState(null);
  const [chatModal, setChatModal] = useState(null);
  const [ratedIds, setRatedIds] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bookRes, givenRes] = await Promise.all([
          getMyBookings(),
          api.get("/ratings/given"),
        ]);
        const bookData = bookRes.data || [];
        setBookings(bookData);
        const rated = new Set(
          givenRes.data.data.map((r) => r.contextId?.toString()),
        );
        setRatedIds(rated);

        // Fetch unread counts for bookings that are not cancelled
        const activeBookings = bookData.filter((b) => b.status !== "cancelled");
        if (activeBookings.length > 0) {
          try {
            const unreadRes = await api.post("/messages/unread/bulk", {
              contexts: activeBookings.map((b) => ({
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
      await cancelBooking(id, "student");
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id
            ? { ...b, status: "cancelled", cancelledBy: "student" }
            : b,
        ),
      );
      toast.success("Booking cancelled");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  };

  const handleRated = (bookingId) => {
    setRatedIds((prev) => new Set([...prev, bookingId.toString()]));
    setRatingModal(null);
    toast.success("Rating submitted!");
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-teal-50 rounded-xl">
            <CalendarDays className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-800">My Bookings</h1>
            <p className="text-sm text-stone-500">
              All your parking reservations
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
            <CalendarDays className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-500 text-sm font-semibold">
              No bookings yet.
            </p>
            <p className="text-stone-400 text-xs mt-1">
              Find a parking spot to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const rateable = isRateable(booking);
              const alreadyRated = ratedIds.has(booking._id?.toString());
              const homeowner = booking.homeowner;
              const canChat = booking.status !== "cancelled";
              const unread = unreadCounts[`parking_${booking._id}`] || 0;
              const spotId = booking.spotId?._id || booking.spotId;

              return (
                <div
                  key={booking._id}
                  className="bg-white border border-stone-200 rounded-2xl p-5 hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Announcement Banner */}
                      <AnnouncementBanner spotId={spotId} />

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

                      {/* Date, time, price */}
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
                          <MapPin className="w-3.5 h-3.5" />
                          {booking.discountAmount > 0 ? (
                            <span className="flex items-center gap-1.5">
                              <span className="text-stone-400 line-through text-xs font-normal">
                                ৳{booking.totalPrice}
                              </span>
                              <span>
                                ৳{booking.finalAmount ?? booking.totalPrice}
                              </span>
                              <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full font-semibold">
                                Coupon applied
                              </span>
                            </span>
                          ) : (
                            <span>৳{booking.totalPrice}</span>
                          )}
                        </span>
                      </div>

                      {/* Homeowner info */}
                      {homeowner && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 w-fit">
                          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0 border border-amber-200">
                            {homeowner.photoUrl ? (
                              <img
                                src={homeowner.photoUrl}
                                className="w-full h-full object-cover"
                                alt={homeowner.name}
                              />
                            ) : (
                              <span className="text-xs font-bold text-amber-700">
                                {homeowner.name?.[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-700">
                              {homeowner.name}
                            </p>
                            <p className="text-xs text-stone-400">
                              Homeowner · Trust {homeowner.trustScore}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Already rated */}
                      {rateable && alreadyRated && (
                        <div className="flex items-center gap-1.5 text-xs text-teal-600">
                          <Star className="w-3.5 h-3.5 fill-teal-500 text-teal-500" />
                          You've rated this booking
                        </div>
                      )}
                    </div>

                    {/* Action buttons — vertical stack */}
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      {/* Chat button */}
                      {canChat && homeowner && (
                        <button
                          onClick={() => setChatModal({ booking, homeowner })}
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

                      {/* Rate button */}
                      {rateable && !alreadyRated && homeowner && (
                        <button
                          onClick={() => setRatingModal({ booking, homeowner })}
                          className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl hover:bg-amber-100 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          Rate Spot
                        </button>
                      )}

                      {/* Cancel button */}
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

      {/* Rating Modal */}
      {ratingModal && (
        <RatingModal
          ratedUser={ratingModal.homeowner}
          contextType="parking"
          contextId={ratingModal.booking._id}
          ratedRole="homeowner"
          onClose={() => setRatingModal(null)}
          onSuccess={() => handleRated(ratingModal.booking._id)}
        />
      )}

      {/* Chat Modal — parking theme */}
      {chatModal && (
        <ChatModal
          contextType="parking"
          contextId={chatModal.booking._id}
          title={`Booking #${chatModal.booking._id.slice(-6).toUpperCase()}`}
          participants={[
            {
              name: chatModal.homeowner.name,
              photoUrl: chatModal.homeowner.photoUrl,
            },
          ]}
          onClose={() => setChatModal(null)}
        />
      )}
    </DashboardLayout>
  );
}