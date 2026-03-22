import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  MapPin,
  Home,
  Car,
  Shield,
  Bell,
} from "lucide-react";
import { bookingSchema } from "../schemas/bookingSchema";
import { createBooking } from "../../../services/bookingService";
import { initiatePayment } from "../../../services/paymentService";
import { parkingService } from "../../../services/parkingService";
import DashboardLayout from "../../../components/ui/DashboardLayout";
import FormField from "../../../components/ui/FormField";
import Button from "../../../components/ui/Button";

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

const calcPrice = (startTime, endTime, pricePerDay) => {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const hours = (eh * 60 + em - (sh * 60 + sm)) / 60;
  if (hours <= 0) return 0;
  // pricePerDay / 24 * hours
  return Math.round((pricePerDay / 24) * hours);
};

export default function BookSpotPage() {
  const navigate = useNavigate();
  const { spotId } = useParams();
  const [loading, setLoading] = useState(false);
  const [spot, setSpot] = useState(null);
  const [spotLoading, setSpotLoading] = useState(true);

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

  const onSubmit = async (data) => {
    if (totalPrice <= 0) {
      toast.error("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      // Create booking with real spot data
      const bookingRes = await createBooking({
        ...data,
        spotId: spot._id,
        homeownerId: spot.owner._id || spot.owner,
        totalPrice,
      });
      const bookingId = bookingRes.data._id;

      // Initiate payment
      const paymentRes = await initiatePayment(bookingId);
      if (paymentRes.url) {
        window.location.href = paymentRes.url;
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
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
            <h1 className="text-xl font-semibold text-stone-800">
              Book a Spot
            </h1>
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
              ৳{spot.pricePerDay} / day · Available {spot.availableFrom} –{" "}
              {spot.availableTo}
            </p>
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

            <div
              className={`rounded-xl px-4 py-3 flex items-center justify-between
              ${totalPrice > 0 ? "bg-teal-50 border border-teal-100" : "bg-stone-50 border border-stone-100"}`}
            >
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Clock className="w-4 h-4 text-stone-400" />
                {startTime && endTime && totalPrice > 0
                  ? `${startTime} — ${endTime}`
                  : "Select start and end time"}
              </div>
              <p
                className={`text-sm font-bold ${totalPrice > 0 ? "text-teal-700" : "text-stone-400"}`}
              >
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
