import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ShieldAlert,
  MapPin,
  Home,
  Car,
  Shield,
  Bell,
  AlertTriangle,
  Car as CarIcon,
  Package,
  Eye,
  MoreHorizontal,
  CheckCircle2,
} from "lucide-react";
import { incidentSchema } from "../schemas/incidentSchema";
import { submitIncident } from "../../../services/incidentService";
import Button from "../../../components/ui/Button";
import FormField from "../../../components/ui/FormField";
import DashboardLayout from "../../../components/ui/DashboardLayout";

const CATEGORIES = [
  { value: "harassment", label: "Harassment", icon: AlertTriangle, color: "text-red-500 bg-red-50 border-red-200" },
  { value: "unsafe_driving", label: "Unsafe Driving", icon: CarIcon, color: "text-orange-500 bg-orange-50 border-orange-200" },
  { value: "theft", label: "Theft", icon: Package, color: "text-purple-500 bg-purple-50 border-purple-200" },
  { value: "suspicious_activity", label: "Suspicious Activity", icon: Eye, color: "text-amber-500 bg-amber-50 border-amber-200" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "text-stone-500 bg-stone-50 border-stone-200" },
];

const navItems = [
  { path: "/dashboard", label: "Overview", icon: Home },
  { path: "/dashboard/parking", label: "Find Parking", icon: MapPin },
  { path: "/dashboard/carpool", label: "Carpooling", icon: Car },
  { path: "/dashboard/sos", label: "SOS & Safety", icon: Shield },
  { path: "/dashboard/report-incident", label: "Report Incident", icon: ShieldAlert },
  { path: "/dashboard/notifications", label: "Notifications", icon: Bell, soon: true },
];

export default function ReportIncidentPage() {
  const [gpsStatus, setGpsStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

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
      () => setGpsStatus("denied")
    );
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await submitIncident(data);
      toast.success("Report submitted anonymously");
      setSubmitted(true);
      reset();
      setSelectedCategory("");
      setGpsStatus("pending");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-stone-800 mb-2">Report Submitted</h2>
            <p className="text-sm text-stone-500 mb-1">Your report has been received anonymously.</p>
            <p className="text-xs text-stone-400 mb-8">Our team will review it shortly.</p>
            <Button onClick={() => setSubmitted(false)}>
              Submit Another Report
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div className="min-h-screen bg-stone-50 px-4 py-10">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-900">Report an Incident</h1>
                <p className="text-sm text-stone-500">Your identity will remain completely anonymous</p>
              </div>
            </div>

            {/* Anonymous badge */}
            <div className="mt-4 flex items-center gap-2 bg-stone-900 text-white text-xs font-medium px-3 py-2 rounded-lg w-fit">
              <Shield className="w-3.5 h-3.5" />
              Anonymous reporting — your name is never stored in reports
            </div>
          </div>

          {/* GPS status */}
          <div className={`flex items-center gap-2 text-xs font-medium mb-6 px-3 py-2.5 rounded-lg border
            ${gpsStatus === "granted"
              ? "bg-teal-50 text-teal-700 border-teal-200"
              : gpsStatus === "denied"
              ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-stone-100 text-stone-500 border-stone-200"}`}>
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            {gpsStatus === "granted" && "📍 GPS location captured — will be attached to your report"}
            {gpsStatus === "denied" && "GPS unavailable — enter your location manually below"}
            {gpsStatus === "pending" && "Requesting GPS location..."}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Category — visual card selector */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                Incident Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const isSelected = selectedCategory === c.value;
                  return (
                    <label
                      key={c.value}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all
                        ${isSelected
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"}`}
                    >
                      <input
                        type="radio"
                        value={c.value}
                        className="sr-only"
                        {...register("category")}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setValue("category", e.target.value);
                        }}
                      />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                        ${isSelected ? "bg-white/20" : c.color.split(" ").slice(1).join(" ")}`}>
                        <Icon className={`w-4 h-4 ${isSelected ? "text-white" : c.color.split(" ")[0]}`} />
                      </div>
                      <span className="text-xs font-medium text-center leading-tight">{c.label}</span>
                    </label>
                  );
                })}
              </div>
              {errors.category && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700">
                What happened? <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("description")}
                rows={5}
                placeholder="Describe the incident in detail. Include time, people involved, and any other relevant information. (minimum 20 characters)"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200
                  bg-white text-stone-900 placeholder:text-stone-400 resize-none
                  hover:border-stone-300 focus:outline-none focus:ring-2
                  focus:ring-teal-600/20 focus:border-teal-600 transition-colors"
              />
              {errors.description && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500 inline-block flex-shrink-0" />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Location */}
            <FormField
              label="Location (optional)"
              placeholder="e.g. Gate 2, NSU campus, Road 27"
              error={errors.location?.message}
              hint="Add a landmark or area to help responders locate the incident"
              {...register("location")}
            />

            {/* Divider */}
            <div className="border-t border-stone-100 pt-2">
              <p className="text-xs text-stone-400 mb-4">
                By submitting, you confirm this report is truthful. False reports may result in account suspension.
              </p>
              <Button type="submit" loading={loading}>
                <ShieldAlert className="w-4 h-4" />
                Submit Report Anonymously
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}