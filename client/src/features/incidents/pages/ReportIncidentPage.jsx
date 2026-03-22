import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldAlert, MapPin, Home, Car, Shield, Bell } from "lucide-react";
import { incidentSchema } from "../schemas/incidentSchema";
import { submitIncident } from "../../../services/incidentService";
import Button from "../../../components/ui/Button";
import FormField from "../../../components/ui/FormField";
import DashboardLayout from "../../../components/ui/DashboardLayout";

const CATEGORIES = [
  { value: "harassment", label: "Harassment" },
  { value: "unsafe_driving", label: "Unsafe Driving" },
  { value: "theft", label: "Theft" },
  { value: "suspicious_activity", label: "Suspicious Activity" },
  { value: "other", label: "Other" },
];

// FIX: student nav — matches StudentDashboard navItems
const navItems = [
  { path: "/dashboard", label: "Overview", icon: Home },
  { path: "/dashboard/parking", label: "Find Parking", icon: MapPin },
  { path: "/dashboard/carpool", label: "Carpooling", icon: Car },
  { path: "/dashboard/sos", label: "SOS & Safety", icon: Shield },
  {
    path: "/dashboard/report-incident",
    label: "Report Incident",
    icon: ShieldAlert,
  },
  {
    path: "/dashboard/notifications",
    label: "Notifications",
    icon: Bell,
    soon: true,
  },
];

export default function ReportIncidentPage() {
  const navigate = useNavigate();
  const [gpsStatus, setGpsStatus] = useState("pending");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(incidentSchema) });

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("coordinates.lat", pos.coords.latitude);
        setValue("coordinates.lng", pos.coords.longitude);
        setGpsStatus("granted");
      },
      () => setGpsStatus("denied"),
    );
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await submitIncident(data);
      toast.success("Report submitted anonymously");
      reset();
      setGpsStatus("pending");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // FIX: wrapped in DashboardLayout so sidebar shows correctly
  return (
    <DashboardLayout navItems={navItems}>
      <div className="min-h-screen bg-stone-50 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-stone-200 rounded-lg">
              <ShieldAlert className="w-6 h-6 text-stone-700" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-stone-800">
                Report an Incident
              </h1>
              <p className="text-sm text-stone-500">
                Your identity will remain anonymous
              </p>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
            <div
              className={`flex items-center gap-2 text-sm mb-6 px-3 py-2 rounded-lg
              ${
                gpsStatus === "granted"
                  ? "bg-teal-50 text-teal-700"
                  : gpsStatus === "denied"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-stone-100 text-stone-500"
              }`}
            >
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {gpsStatus === "granted" && "GPS location captured automatically"}
              {gpsStatus === "denied" &&
                "GPS unavailable — you can type your location below"}
              {gpsStatus === "pending" && "Requesting GPS location..."}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700 select-none">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("category")}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-200
                    bg-white text-stone-900 hover:border-stone-300 focus:outline-none
                    focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-colors"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700 select-none">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Describe what happened (minimum 20 characters)"
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-200
                    bg-white text-stone-900 placeholder:text-stone-400 resize-none
                    hover:border-stone-300 focus:outline-none focus:ring-2
                    focus:ring-teal-600/20 focus:border-teal-600 transition-colors"
                />
                {errors.description && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500 flex-shrink-0" />
                    {errors.description.message}
                  </p>
                )}
              </div>

              <FormField
                label="Location (optional)"
                placeholder="e.g. Gate 2, NSU campus"
                error={errors.location?.message}
                {...register("location")}
              />

              <Button type="submit" loading={loading}>
                Submit Report Anonymously
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
