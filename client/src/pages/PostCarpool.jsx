import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import api from "../lib/api";
import UniversityRouteDropdown from "../components/UniversityRouteDropdown";
import CarpoolMapPicker from "../components/CarpoolMapPicker";

const TAKA = "\u09F3";
const ARROW = "\u2192";

export default function PostCarpool() {
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [pickup, setPickup] = useState(null); // { name, area, lat, lng }
  const [dropoff, setDropoff] = useState(null); // { name, area, lat, lng }
  const [departureTime, setDepartureTime] = useState("");
  const [totalSeats, setTotalSeats] = useState(3);
  const [pricePerSeat, setPricePerSeat] = useState("");
  const [genderSafe, setGenderSafe] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [routeMode, setRouteMode] = useState("preset"); // "preset" | "custom"

  const handleRouteSelect = (route) => {
    setSelectedPreset(route);
    if (!route) {
      setPricePerSeat("");
      setPickup(null);
      setDropoff(null);
      return;
    }
    // Auto-fill pickup and dropoff from preset
    setPickup({
      name: route.origin.name,
      area: route.origin.area,
      lat: route.origin.lat,
      lng: route.origin.lng,
    });
    setDropoff({
      name: route.destination.name,
      area: route.destination.area,
      lat: route.destination.lat,
      lng: route.destination.lng,
    });
    setPricePerSeat(Math.round(route.estimatedKm * 4).toString());
  };

  const handleSeats = (val) => {
    setTotalSeats(val);
    if (selectedPreset) {
      setPricePerSeat(Math.round(selectedPreset.estimatedKm * 4).toString());
    }
  };

  const handleReset = () => {
    setPickup(null);
    setDropoff(null);
  };

  const handleSubmit = async () => {
    setError("");
    if (!pickup || !dropoff) {
      setError("Please set both pickup and drop-off points on the map.");
      return;
    }
    if (!departureTime) {
      setError("Please set a departure time.");
      return;
    }
    if (!pricePerSeat) {
      setError("Please set a price per seat.");
      return;
    }
    if (new Date(departureTime) <= new Date()) {
      setError("Departure time must be in the future.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/carpool/routes", {
        presetRouteId: selectedPreset?.id || null,
        origin: pickup,
        destination: dropoff,
        departureTime,
        totalSeats,
        pricePerSeat: Number(pricePerSeat),
        genderSafe,
        notes,
      });
      navigate("/dashboard/carpool");
    } catch (err) {
      setError(err.message || "Failed to post ride.");
    } finally {
      setSubmitting(false);
    }
  };

  const minDateTime = new Date(Date.now() + 10 * 60 * 1000)
    .toISOString()
    .slice(0, 16);
  const canProceedToStep3 = pickup && dropoff && departureTime && pricePerSeat;

  return (
    <div className="min-h-screen dashboard-bg p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Dashboard
          </button>
          <span className="text-stone-300">/</span>
          <button
            onClick={() => navigate("/dashboard/carpool")}
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            Carpool
          </button>
          <span className="text-stone-300">/</span>
          <span className="text-sm text-stone-600 font-semibold">
            Post Ride
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900">
            Post a Carpool Ride
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Share your commute and split fuel costs
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  step > s
                    ? "bg-teal-600 text-white"
                    : step === s
                      ? "bg-teal-600 text-white ring-4 ring-teal-100"
                      : "bg-stone-200 text-stone-500"
                }`}
              >
                {step > s ? (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  s
                )}
              </div>
              <span
                className={`text-xs font-semibold ${step === s ? "text-teal-700" : "text-stone-400"}`}
              >
                {s === 1 ? "Pick route" : s === 2 ? "Trip details" : "Confirm"}
              </span>
              {s < 3 && (
                <div
                  className={`h-px flex-1 ${step > s ? "bg-teal-300" : "bg-stone-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1 — Route selection ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="p-6 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-900 mb-1">
                Select your university route
              </h2>
              <p className="text-xs text-stone-400">
                Filter by university then pick your route, or use the map below
              </p>
            </div>

            {/* Mode toggle */}
            <div className="px-6 pt-5">
              <div className="flex bg-stone-100 rounded-xl p-1 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setRouteMode("preset");
                    setPickup(null);
                    setDropoff(null);
                    setSelectedPreset(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${routeMode === "preset" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"}`}
                >
                  University Routes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRouteMode("custom");
                    setSelectedPreset(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${routeMode === "custom" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"}`}
                >
                  Pin on Map
                </button>
              </div>
            </div>

            {routeMode === "preset" && (
              <div className="px-6 pb-2">
                <UniversityRouteDropdown onRouteSelect={handleRouteSelect} />

                {/* Preview map for selected preset */}
                {selectedPreset && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                      Route Preview
                    </p>
                    <CarpoolMapPicker
                      pickup={pickup}
                      dropoff={dropoff}
                      onPickup={() => {}}
                      onDropoff={() => {}}
                      onReset={() => {}}
                      presetOrigin={selectedPreset.origin}
                      presetDestination={selectedPreset.destination}
                      readOnly
                    />
                  </div>
                )}
              </div>
            )}

            {routeMode === "custom" && (
              <div className="px-6 pb-2">
                <p className="text-xs text-stone-500 mb-3 leading-relaxed">
                  Tap the map to set your{" "}
                  <span className="font-bold text-teal-600">pickup point</span>,
                  then tap again for your{" "}
                  <span className="font-bold text-rose-500">
                    drop-off point
                  </span>
                  .
                </p>
                <CarpoolMapPicker
                  pickup={pickup}
                  dropoff={dropoff}
                  onPickup={setPickup}
                  onDropoff={setDropoff}
                  onReset={handleReset}
                />
              </div>
            )}

            <div className="px-6 pb-6 pt-4 flex flex-col gap-3">
              {routeMode === "preset" ? (
                <>
                  <button
                    onClick={() => {
                      if (selectedPreset) setStep(2);
                    }}
                    disabled={!selectedPreset}
                    className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-all"
                  >
                    Continue with this route
                  </button>
                  <button
                    onClick={() => {
                      setRouteMode("custom");
                      setSelectedPreset(null);
                      setPickup(null);
                      setDropoff(null);
                    }}
                    className="w-full py-3 rounded-xl border border-dashed border-stone-300 text-sm text-stone-500 hover:border-teal-400 hover:text-teal-600 transition-all"
                  >
                    Pin on map instead
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    if (pickup && dropoff) setStep(2);
                  }}
                  disabled={!pickup || !dropoff}
                  className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-all"
                >
                  {!pickup
                    ? "Set pickup point on map"
                    : !dropoff
                      ? "Set drop-off point on map"
                      : "Continue with this route →"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2 — Trip details ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            {/* Route summary with mini map */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                <div>
                  {selectedPreset && (
                    <p className="text-xs text-teal-600 font-semibold mb-0.5">
                      {selectedPreset.university}
                    </p>
                  )}
                  <p className="text-sm font-bold text-stone-900">
                    {pickup?.area} {ARROW} {dropoff?.area}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {pickup?.name} {ARROW} {dropoff?.name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {selectedPreset && (
                    <p className="text-sm font-bold text-teal-600">
                      ~{selectedPreset.estimatedKm} km
                    </p>
                  )}
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs text-stone-400 hover:text-teal-600 transition-colors"
                  >
                    Change route
                  </button>
                </div>
              </div>
              {/* Mini read-only map */}
              <div className="px-5 pb-5">
                <CarpoolMapPicker
                  pickup={pickup}
                  dropoff={dropoff}
                  onPickup={() => {}}
                  onDropoff={() => {}}
                  onReset={() => {}}
                  presetOrigin={pickup}
                  presetDestination={dropoff}
                  readOnly
                />
              </div>
            </div>

            {/* Departure time */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
                Departure Time
              </p>
              <input
                type="datetime-local"
                min={minDateTime}
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 hover:border-stone-300 transition-colors"
              />
            </div>

            {/* Seats & Pricing */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">
                Seats & Pricing
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-stone-500 mb-3">Available seats</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSeats(Math.max(1, totalSeats - 1))}
                      className="w-9 h-9 rounded-full border-2 border-stone-200 text-stone-600 hover:border-teal-400 hover:text-teal-600 transition-all font-bold text-lg flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-2xl font-bold text-stone-900 w-6 text-center">
                      {totalSeats}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSeats(Math.min(6, totalSeats + 1))}
                      className="w-9 h-9 rounded-full border-2 border-stone-200 text-stone-600 hover:border-teal-400 hover:text-teal-600 transition-all font-bold text-lg flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-xs text-stone-400 mt-2">Max 6 seats</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 mb-3">
                    Price per seat ({TAKA})
                  </p>
                  <input
                    type="number"
                    min="0"
                    value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border-2 border-stone-200 px-4 py-3 text-lg font-bold text-stone-900 focus:outline-none focus:border-teal-500 hover:border-stone-300 transition-colors"
                  />
                  {selectedPreset && pricePerSeat && (
                    <p className="text-xs text-teal-600 mt-1.5">
                      Suggested based on {selectedPreset.estimatedKm} km
                    </p>
                  )}
                </div>
              </div>
              {pricePerSeat && (
                <div className="mt-4 bg-stone-50 rounded-xl p-3 flex items-center justify-between">
                  <p className="text-xs text-stone-500">
                    Potential earnings ({totalSeats} seats)
                  </p>
                  <p className="text-sm font-bold text-teal-600">
                    {TAKA}
                    {Number(pricePerSeat) * totalSeats}
                  </p>
                </div>
              )}
            </div>

            {/* Gender safe */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => setGenderSafe(!genderSafe)}
                  className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all cursor-pointer ${genderSafe ? "bg-pink-500 border-pink-500" : "border-stone-300"}`}
                >
                  {genderSafe && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800">
                    Female passengers only
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Only female students can see and join this ride
                  </p>
                </div>
              </label>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
                Notes{" "}
                <span className="font-normal normal-case">(optional)</span>
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={300}
                rows={2}
                placeholder="e.g. I'll wait 5 mins at the gate."
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 resize-none hover:border-stone-300 transition-colors"
              />
              <p className="text-xs text-stone-400 text-right mt-1">
                {notes.length}/300
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-xl border-2 border-stone-200 text-sm font-bold text-stone-600 hover:border-stone-300 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (canProceedToStep3) setStep(3);
                }}
                disabled={!canProceedToStep3}
                className="flex-[2] py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all"
              >
                Review Ride
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 — Confirm ── */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
              <div className="bg-teal-600 px-6 py-5">
                <p className="text-teal-200 text-xs font-semibold mb-1">
                  Your ride summary
                </p>
                <h2 className="text-white text-lg font-bold">
                  {pickup?.area} {ARROW} {dropoff?.area}
                </h2>
              </div>

              {/* Confirmation map */}
              <div className="p-5 pb-0">
                <CarpoolMapPicker
                  pickup={pickup}
                  dropoff={dropoff}
                  onPickup={() => {}}
                  onDropoff={() => {}}
                  onReset={() => {}}
                  presetOrigin={pickup}
                  presetDestination={dropoff}
                  readOnly
                />
              </div>

              <div className="divide-y divide-stone-50">
                {[
                  ["Pickup", pickup?.name],
                  ["Drop-off", dropoff?.name],
                  [
                    "Departure",
                    new Date(departureTime).toLocaleString("en-BD", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  ],
                  ["Seats available", totalSeats],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <span className="text-sm text-stone-500">{label}</span>
                    <span className="text-sm font-semibold text-stone-900">
                      {value}
                    </span>
                  </div>
                ))}
                <div className="px-6 py-4 flex items-center justify-between">
                  <span className="text-sm text-stone-500">Price per seat</span>
                  <span className="text-sm font-bold text-teal-600">
                    {TAKA}
                    {pricePerSeat}
                  </span>
                </div>
                <div className="px-6 py-4 flex items-center justify-between">
                  <span className="text-sm text-stone-500">Gender safe</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      genderSafe
                        ? "bg-pink-50 text-pink-600 border border-pink-200"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {genderSafe ? "Female only" : "Everyone"}
                  </span>
                </div>
                {notes && (
                  <div className="px-6 py-4 flex items-start justify-between gap-4">
                    <span className="text-sm text-stone-500 flex-shrink-0">
                      Notes
                    </span>
                    <span className="text-sm text-stone-700 text-right">
                      {notes}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 rounded-xl border-2 border-stone-200 text-sm font-bold text-stone-600 hover:border-stone-300 transition-all"
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all"
              >
                {submitting ? "Posting..." : "Post Ride"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
