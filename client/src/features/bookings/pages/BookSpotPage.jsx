import { useState } from "react";
import { initiatePayment } from "../../../services/paymentService";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CalendarDays, Clock, MapPin, Home, Car, Shield, Bell } from "lucide-react";
import { bookingSchema } from "../schemas/bookingSchema";
import { createBooking } from "../../../services/bookingService";
import DashboardLayout from "../../../components/ui/DashboardLayout";
import FormField from "../../../components/ui/FormField";
import Button from "../../../components/ui/Button";

// ── Dummy spot — replace with real data after F-01 is merged ──
const DUMMY_SPOT = {
  _id: "507f1f77bcf86cd799439011",
  title: "Covered Parking — NSU Gate 2",
  address: "Road 103, Gulshan 2, Dhaka",
  pricePerHour: 50,
  homeownerId: "507f1f77bcf86cd799439012",
};

const navItems = [
  { path: "/dashboard", label: "Overview", icon: Home },
  { path: "/dashboard/parking", label: "Find Parking", icon: MapPin },
  { path: "/dashboard/bookings", label: "My Bookings", icon: CalendarDays },
  { path: "/dashboard/carpool", label: "Carpooling", icon: Car, soon: true },
  { path: "/dashboard/sos", label: "SOS & Safety", icon: Shield, soon: true },
  { path: "/dashboard/report-incident", label: "Report Incident", icon: Shield },
  { path: "/dashboard/notifications", label: "Notifications", icon: Bell, soon: true },
];

// Calculate total price from start/end time and price per hour
const calcPrice = (startTime, endTime, pricePerHour) => {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;
  if (hours <= 0) return 0;
  return Math.round(hours * pricePerHour);
};

export default function BookSpotPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      spotId: DUMMY_SPOT._id,
      homeownerId: DUMMY_SPOT.homeownerId,
      totalPrice: 0,
    },
  });

  const startTime = watch("startTime");
  const endTime = watch("endTime");
  const totalPrice = calcPrice(startTime, endTime, DUMMY_SPOT.pricePerHour);

  const onSubmit = async (data) => {
  if (totalPrice <= 0) {
    toast.error("End time must be after start time");
    return;
  }

  setLoading(true);
  try {
    // Step 1 — create booking
    const bookingRes = await createBooking({ ...data, totalPrice });
    const bookingId = bookingRes.data._id;

    // Step 2 — initiate payment
    const paymentRes = await initiatePayment(bookingId);

    if (paymentRes.url) {
      // Step 3 — redirect to SSLCommerz
      window.location.href = paymentRes.url;
    }
  } catch (err) {
    toast.error(err?.response?.data?.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};
  // Today's date in YYYY-MM-DD for min attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        {/* Header */}
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
            <p className="text-sm font-semibold text-stone-800">{DUMMY_SPOT.title}</p>
            <p className="text-xs text-stone-500 mt-0.5">{DUMMY_SPOT.address}</p>
            <p className="text-xs font-medium text-teal-600 mt-1">
              ৳{DUMMY_SPOT.pricePerHour} / hour
            </p>
          </div>
        </div>

        {/* Booking form */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Hidden fields */}
            <input type="hidden" {...register("spotId")} />
            <input type="hidden" {...register("homeownerId")} />

            {/* Date */}
            <FormField
              label="Date"
              type="date"
              min={today}
              error={errors.date?.message}
              {...register("date")}
            />

            {/* Time row */}
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

            {/* Price summary */}
            <div className={`rounded-xl px-4 py-3 flex items-center justify-between
              ${totalPrice > 0 ? "bg-teal-50 border border-teal-100" : "bg-stone-50 border border-stone-100"}`}>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Clock className="w-4 h-4 text-stone-400" />
                {startTime && endTime && totalPrice > 0
                  ? `${startTime} — ${endTime}`
                  : "Select start and end time"}
              </div>
              <p className={`text-sm font-bold
                ${totalPrice > 0 ? "text-teal-700" : "text-stone-400"}`}>
                {totalPrice > 0 ? `৳${totalPrice}` : "৳0"}
              </p>
            </div>

            <Button type="submit" loading={loading}>
              Proceed to Payment
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}