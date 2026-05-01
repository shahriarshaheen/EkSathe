import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CalendarDays, Clock, MapPin, Home, Car, Shield, Bell, Star, X, Loader2,
} from "lucide-react";
import { bookingSchema } from "../schemas/bookingSchema";
import { createBooking } from "../../../services/bookingService";
import { initiatePayment } from "../../../services/paymentService";
import { parkingService } from "../../../services/parkingService";
import DashboardLayout from "../../../components/ui/DashboardLayout";
import FormField from "../../../components/ui/FormField";
import CouponInput from "../../../components/CouponInput";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { path: "/dashboard",           label: "Overview",         icon: Home        },
  { path: "/dashboard/parking",   label: "Find Parking",     icon: MapPin      },
  { path: "/dashboard/bookings",  label: "My Bookings",      icon: CalendarDays },
  { path: "/dashboard/carpool",   label: "Carpooling",       icon: Car         },
  { path: "/dashboard/sos",       label: "SOS & Safety",     icon: Shield      },
  { path: "/dashboard/report-incident", label: "Report Incident", icon: Shield },
  { path: "/dashboard/notifications",   label: "Notifications",   icon: Bell, soon: true },
];

const calcPrice = (startTime, endTime, pricePerDay) => {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;
  if (hours <= 0) return 0;
  return Math.round((pricePerDay / 24) * hours);
};

// ── Payment Options Modal ─────────────────────────────────────────────────────

function PaymentModal({ spot, totalPrice, finalPrice, couponState, onPayOnline, onPayCash, onClose, loading }) {
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
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest">Confirm Booking</p>
            <h2 className="text-base font-black text-stone-900 mt-0.5">{spot.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-stone-400 hover:text-stone-700 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Spot summary */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900">{spot.title}</p>
                <p className="text-xs text-stone-500 mt-0.5">{spot.address}</p>
                {spot.owner?.trustScore != null && (
                  <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    Host trust score: {spot.owner.trustScore}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                {couponState && (
                  <p className="text-xs text-stone-400 line-through">৳{totalPrice}</p>
                )}
                <p className="text-xl font-black text-teal-700">৳{finalPrice}</p>
                <p className="text-xs text-stone-400">total</p>
              </div>
            </div>
          </div>

          {/* Savings row if coupon applied */}
          {couponState && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-center justify-between">
              <p className="text-sm font-bold text-green-700">Coupon applied</p>
              <p className="text-sm font-black text-green-700">Saved ৳{couponState.discountAmount}</p>
            </div>
          )}

          {/* Payment options */}
          <div className="space-y-2 pt-1">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              How would you like to pay?
            </p>

            {/* Pay Online */}
            <button
              type="button"
              onClick={onPayOnline}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-teal-600 text-white text-sm font-black hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                  Pay Online — ৳{finalPrice}
                </>
              )}
            </button>

            {/* Pay in Cash */}
            <button
              type="button"
              onClick={onPayCash}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-stone-100 text-stone-700 text-sm font-bold hover:bg-stone-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border border-stone-200"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <circle cx="12" cy="12" r="2" />
                <path d="M6 12h.01M18 12h.01" />
              </svg>
              Pay in Cash — ৳{totalPrice}
            </button>

            <p className="text-xs text-stone-400 text-center">
              Cash payment: pay the homeowner directly when you arrive
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── BookSpotPage ──────────────────────────────────────────────────────────────

export default function BookSpotPage() {
  const navigate = useNavigate();
  const { spotId } = useParams();
  const [loading, setLoading] = useState(false);
  const [spot, setSpot] = useState(null);
  const [spotLoading, setSpotLoading] = useState(true);
  const [couponState, setCouponState] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(null);

  useEffect(() => {
    const fetchSpot = async () => {
      try {
        const res = await parkingService.getSpotById(spotId);
        setSpot(res.data.spot);
      } catch {
        toast.error("Spot not found");
        navigate("/dashboard/parking");
      } finally {
        setSpotLoading(false);
      }
    };
    if (spotId) fetchSpot();
  }, [spotId, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(bookingSchema) });

  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const totalPrice = spot ? calcPrice(startTime, endTime, spot.pricePerDay) : 0;
  const finalPrice = couponState ? couponState.finalAmount : totalPrice;

  useEffect(() => { setCouponState(null); }, [totalPrice]);

  const handleCouponApply = (data) => setCouponState(data);
  const handleCouponRemove = () => setCouponState(null);

  // Step 1 — validate form and open payment modal
  const onSubmit = async (data) => {
    if (totalPrice <= 0) {
      toast.error("End time must be after start time");
      return;
    }
    setPendingBookingData(data);
    setShowPaymentModal(true);
  };

  // Step 2a — Pay Online via SSLCommerz
  const handlePayOnline = async () => {
    if (!pendingBookingData) return;
    setLoading(true);
    try {
      const bookingRes = await createBooking({
        ...pendingBookingData,
        spotId: spot._id,
        homeownerId: spot.owner._id || spot.owner,
        totalPrice,
      });
      const bookingId = bookingRes.data._id;
      const paymentRes = await initiatePayment(bookingId, couponState?.couponCode || null);
      if (paymentRes.url) window.location.href = paymentRes.url;
    } catch (err) {
      toast.error(err.message || "Something went wrong");
      setShowPaymentModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Step 2b — Pay in Cash — just create booking, no payment redirect
  const handlePayCash = async () => {
    if (!pendingBookingData) return;
    setLoading(true);
    try {
      await createBooking({
        ...pendingBookingData,
        spotId: spot._id,
        homeownerId: spot.owner._id || spot.owner,
        totalPrice,
      });
      setShowPaymentModal(false);
      toast.success("Booking confirmed! Pay the homeowner in cash when you arrive.");
      navigate("/dashboard/bookings");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
      setShowPaymentModal(false);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (spotLoading) {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!spot) return null;

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-teal-50 rounded-lg">
            <CalendarDays className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-800">Book a Spot</h1>
            <p className="text-sm text-stone-500">Pick your date and time</p>
          </div>
        </div>

        {/* Spot info card */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 flex gap-3">
          <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-stone-800">{spot.title}</p>
            <p className="text-xs text-stone-500 mt-0.5">{spot.address}</p>
            <p className="text-xs font-medium text-teal-600 mt-1">
              ৳{spot.pricePerDay} / day · Available {spot.availableFrom} – {spot.availableTo}
            </p>
            {spot.owner?.trustScore != null && (
              <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                Host trust score: {spot.owner.trustScore}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              label="Date"
              type="date"
              min={today}
              error={errors.date?.message}
              {...register("date")}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Start Time"
                type="time"
                error={errors.startTime?.message}
                {...register("startTime")}
              />
              <FormField
                label="End Time"
                type="time"
                error={errors.endTime?.message}
                {...register("endTime")}
              />
            </div>

            {/* Price display */}
            <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${
              totalPrice > 0 ? "bg-teal-50 border border-teal-100" : "bg-stone-50 border border-stone-100"
            }`}>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Clock className="w-4 h-4 text-stone-400" />
                {startTime && endTime && totalPrice > 0
                  ? `${startTime} — ${endTime}`
                  : "Select start and end time"}
              </div>
              <div className="text-right">
                {couponState && totalPrice > 0 && (
                  <p className="text-xs text-stone-400 line-through">৳{totalPrice}</p>
                )}
                <p className={`text-sm font-bold ${totalPrice > 0 ? "text-teal-700" : "text-stone-400"}`}>
                  {totalPrice > 0 ? `৳${finalPrice}` : "৳0"}
                </p>
              </div>
            </div>

            {/* Coupon input */}
            {totalPrice > 0 && (
              <CouponInput
                key={totalPrice}
                amount={totalPrice}
                serviceType="parking"
                onApply={handleCouponApply}
                onRemove={handleCouponRemove}
              />
            )}

            {/* Submit — opens payment modal */}
            <button
              type="submit"
              disabled={totalPrice <= 0}
              className="w-full py-3 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {totalPrice > 0
                ? couponState
                  ? `Continue — ৳${finalPrice} (saved ৳${couponState.discountAmount})`
                  : "Continue to Payment Options"
                : "Select a time slot first"}
            </button>
          </form>
        </div>
      </div>

      {/* Payment modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <PaymentModal
            spot={spot}
            totalPrice={totalPrice}
            finalPrice={finalPrice}
            couponState={couponState}
            onPayOnline={handlePayOnline}
            onPayCash={handlePayCash}
            onClose={() => { if (!loading) setShowPaymentModal(false); }}
            loading={loading}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}