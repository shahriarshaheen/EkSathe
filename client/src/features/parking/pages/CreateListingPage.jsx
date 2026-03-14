import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import {
  MapPin,
  Upload,
  X,
  Home,
  Car,
  ParkingSquare,
  Clock,
  Calendar,
  ArrowLeft,
} from "lucide-react";

import { createSpotSchema } from "../schemas/parkingSchemas";
import { parkingService } from "../../../services/parkingService";
import FormField from "../../../components/ui/FormField";
import Button from "../../../components/ui/Button";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
const DAY_LABELS = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};
const SPOT_TYPES = [
  { value: "garage", label: "Garage", icon: Home },
  { value: "driveway", label: "Driveway", icon: Car },
  { value: "open", label: "Open Area", icon: ParkingSquare },
];

const CreateListingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [locating, setLocating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createSpotSchema),
    defaultValues: {
      spotType: "open",
      availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      availableFrom: "08:00",
      availableTo: "20:00",
    },
  });

  const selectedDays = watch("availableDays") || [];
  const selectedType = watch("spotType");

  // ── Photo dropzone ──
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 3,
    maxSize: 5 * 1024 * 1024,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) {
        toast.error("Max 3 photos, 5MB each. Images only.");
        return;
      }
      const newPhotos = accepted.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) }),
      );
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, 3));
    },
  });

  const removePhoto = (idx) =>
    setPhotos((prev) => prev.filter((_, i) => i !== idx));

  // ── Auto-detect location ──
  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", pos.coords.latitude.toString());
        setValue("longitude", pos.coords.longitude.toString());
        toast.success("Location detected successfully.");
        setLocating(false);
      },
      () => {
        toast.error("Could not detect location. Enter coordinates manually.");
        setLocating(false);
      },
    );
  };

  // ── Toggle day selection ──
  const toggleDay = (day) => {
    const current = selectedDays;
    if (current.includes(day)) {
      setValue(
        "availableDays",
        current.filter((d) => d !== day),
      );
    } else {
      setValue("availableDays", [...current, day]);
    }
  };

  // ── Submit ──
  const onSubmit = async (data) => {
    if (photos.length === 0) {
      toast.error("Please upload at least one photo.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Append all fields except availableDays
      Object.entries(data).forEach(([key, val]) => {
        if (key !== "availableDays") {
          formData.append(key, val);
        }
      });

      // Append each day separately so backend receives as array
      data.availableDays.forEach((day) => {
        formData.append("availableDays[]", day);
      });

      // Append photos
      photos.forEach((photo) => formData.append("photos", photo));

      await parkingService.createSpot(formData);
      toast.success("Parking spot listed successfully!");
      navigate("/dashboard/my-listings");
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
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
          <span className="text-sm font-medium text-stone-600">
            List a Parking Spot
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            List your parking spot
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Fill in the details below. Students near your area will be able to
            find and book your spot.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-8"
        >
          {/* Basic Info */}
          <section className="bg-white rounded-xl border border-stone-200 p-6 space-y-5">
            <h2 className="font-semibold text-stone-800 text-sm uppercase tracking-wide">
              Basic Information
            </h2>

            <FormField
              id="title"
              label="Listing title"
              placeholder='e.g. "Covered garage near NSU gate 2"'
              error={errors.title?.message}
              {...register("title")}
            />

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Description{" "}
                <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe your spot — size, access instructions, nearby landmarks..."
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent resize-none"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Spot type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {SPOT_TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue("spotType", value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedType === value
                        ? "border-teal-600 bg-teal-50 text-teal-700"
                        : "border-stone-200 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Location */}
          <section className="bg-white rounded-xl border border-stone-200 p-6 space-y-5">
            <h2 className="font-semibold text-stone-800 text-sm uppercase tracking-wide">
              Location
            </h2>

            <FormField
              id="address"
              label="Full address"
              placeholder='e.g. "House 12, Road 4, Bashundhara R/A, Dhaka"'
              error={errors.address?.message}
              {...register("address")}
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-stone-700">
                  GPS Coordinates
                </label>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locating}
                  className="flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 disabled:opacity-50 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {locating ? "Detecting..." : "Auto-detect my location"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  id="latitude"
                  label="Latitude"
                  placeholder="e.g. 23.8103"
                  error={errors.latitude?.message}
                  {...register("latitude")}
                />
                <FormField
                  id="longitude"
                  label="Longitude"
                  placeholder="e.g. 90.4125"
                  error={errors.longitude?.message}
                  {...register("longitude")}
                />
              </div>
              <p className="text-xs text-stone-400 mt-2">
                Click "Auto-detect" to fill automatically, or enter manually
                from Google Maps.
              </p>
            </div>
          </section>

          {/* Pricing & Availability */}
          <section className="bg-white rounded-xl border border-stone-200 p-6 space-y-5">
            <h2 className="font-semibold text-stone-800 text-sm uppercase tracking-wide">
              Pricing & Availability
            </h2>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Price per day (৳)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-medium">
                  ৳
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 150"
                  className="w-full rounded-lg border border-stone-300 pl-7 pr-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  {...register("pricePerDay")}
                />
              </div>
              {errors.pricePerDay && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.pricePerDay.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                Available hours
              </label>
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  id="availableFrom"
                  label="From"
                  type="time"
                  error={errors.availableFrom?.message}
                  {...register("availableFrom")}
                />
                <FormField
                  id="availableTo"
                  label="To"
                  type="time"
                  error={errors.availableTo?.message}
                  {...register("availableTo")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                Available days
              </label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedDays.includes(day)
                        ? "bg-stone-900 text-white"
                        : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                    }`}
                  >
                    {DAY_LABELS[day]}
                  </button>
                ))}
              </div>
              {errors.availableDays && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.availableDays.message}
                </p>
              )}
            </div>
          </section>

          {/* Photos */}
          <section className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-stone-800 text-sm uppercase tracking-wide">
                Photos
              </h2>
              <span className="text-xs text-stone-400">
                {photos.length}/3 uploaded
              </span>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video rounded-lg overflow-hidden group"
                  >
                    <img
                      src={photo.preview}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photos.length < 3 && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-teal-500 bg-teal-50"
                    : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 text-stone-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-stone-600">
                  {isDragActive
                    ? "Drop photos here"
                    : "Drag photos here or click to browse"}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  JPG, PNG, WebP — max 5MB each — up to {3 - photos.length} more
                </p>
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-white text-stone-700 border border-stone-300 hover:bg-stone-50"
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              List my spot
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateListingPage;
