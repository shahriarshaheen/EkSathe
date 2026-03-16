import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import UniversityRouteDropdown from "../components/UniversityRouteDropdown";

const TAKA = "\u09F3";
const ARROW = "\u2192";

export default function PostCarpool() {
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [origin, setOrigin]                 = useState("");
  const [destination, setDestination]       = useState("");
  const [departureTime, setDepartureTime]   = useState("");
  const [totalSeats, setTotalSeats]         = useState(3);
  const [pricePerSeat, setPricePerSeat]     = useState("");
  const [genderSafe, setGenderSafe]         = useState(false);
  const [notes, setNotes]                   = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState("");
  const [step, setStep]                     = useState(1);

  const handleRouteSelect = (route) => {
    setSelectedPreset(route);
    if (!route) { setOrigin(""); setDestination(""); setPricePerSeat(""); return; }
    setOrigin(route.origin.name);
    setDestination(route.destination.name);
    setPricePerSeat(Math.round((route.estimatedKm * 10) / totalSeats).toString());
  };

  const handleSeats = (val) => {
    setTotalSeats(val);
    if (selectedPreset) setPricePerSeat(Math.round((selectedPreset.estimatedKm * 10) / val).toString());
  };

  const handleSubmit = async () => {
    setError("");
    if (!origin || !destination || !departureTime || !pricePerSeat) {
      setError("Please fill all required fields."); return;
    }
    if (new Date(departureTime) <= new Date()) {
      setError("Departure time must be in the future."); return;
    }
    setSubmitting(true);
    try {
      await api.post("/carpool/routes", {
        presetRouteId: selectedPreset?.id || null,
        origin:      selectedPreset ? selectedPreset.origin      : { name: origin,      area: origin,      lat: 0, lng: 0 },
        destination: selectedPreset ? selectedPreset.destination : { name: destination, area: destination, lat: 0, lng: 0 },
        departureTime, totalSeats,
        pricePerSeat: Number(pricePerSeat),
        genderSafe, notes,
      });
      navigate("/dashboard/carpool");
    } catch (err) {
      setError(err.message || "Failed to post ride.");
    } finally {
      setSubmitting(false);
    }
  };

  const minDateTime = new Date(Date.now() + 10 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <button onClick={() => navigate("/dashboard/carpool")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-4 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to rides
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Post a Carpool Ride</h1>
          <p className="text-sm text-gray-500 mt-1">Share your commute and split fuel costs</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                step > s ? "bg-teal-600 text-white" :
                step === s ? "bg-teal-600 text-white ring-4 ring-teal-100" :
                "bg-gray-200 text-gray-500"}`}>
                {step > s
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : s}
              </div>
              <span className={`text-xs font-medium ${step === s ? "text-teal-700" : "text-gray-400"}`}>
                {s === 1 ? "Pick route" : s === 2 ? "Trip details" : "Confirm"}
              </span>
              {s < 3 && <div className={`h-px flex-1 ${step > s ? "bg-emerald-300" : "bg-gray-200"}`}/>}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Select your university route</h2>
              <p className="text-xs text-gray-400">Filter by university then pick your route</p>
            </div>
            <div className="p-6">
              <UniversityRouteDropdown onRouteSelect={handleRouteSelect} />
            </div>
            <div className="px-6 pb-6 flex flex-col gap-3">
              <button onClick={() => { if (selectedPreset) setStep(2); }} disabled={!selectedPreset}
                className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-bold transition-all">
                Continue with this route
              </button>
              <button onClick={() => { setSelectedPreset(null); setOrigin(""); setDestination(""); setStep(2); }}
                className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-all">
                Enter a custom route instead
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            {selectedPreset ? (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-teal-600 font-medium mb-0.5">{selectedPreset.university}</p>
                  <p className="text-sm font-semibold text-emerald-900">
                    {selectedPreset.origin.area} {ARROW} {selectedPreset.destination.area}
                  </p>
                  <p className="text-xs text-teal-600 mt-0.5">
                    {selectedPreset.origin.name} {ARROW} {selectedPreset.destination.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-teal-700">~{selectedPreset.estimatedKm} km</p>
                  <button onClick={() => setStep(1)} className="text-xs text-teal-600 hover:underline">Change</button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Custom Route</p>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-teal-500"/>
                  <input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Pickup point"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"/>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-rose-500"/>
                  <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Drop-off point"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"/>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Departure Time</p>
              <input type="datetime-local" min={minDateTime} value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50"/>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Seats & Pricing</p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-3">Available seats</p>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => handleSeats(Math.max(1, totalSeats - 1))}
                      className="w-9 h-9 rounded-full border-2 border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-all font-bold text-lg flex items-center justify-center">
                      -
                    </button>
                    <span className="text-2xl font-bold text-gray-900 w-6 text-center">{totalSeats}</span>
                    <button type="button" onClick={() => handleSeats(Math.min(6, totalSeats + 1))}
                      className="w-9 h-9 rounded-full border-2 border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-all font-bold text-lg flex items-center justify-center">
                      +
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Max 6 seats</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-3">Price per seat ({TAKA})</p>
                  <input type="number" min="0" value={pricePerSeat}
                    onChange={(e) => setPricePerSeat(e.target.value)} placeholder="0"
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:border-teal-400 bg-gray-50"/>
                  {selectedPreset && pricePerSeat && (
                    <p className="text-xs text-teal-600 mt-1.5">Suggested based on {selectedPreset.estimatedKm} km</p>
                  )}
                </div>
              </div>
              {pricePerSeat && (
                <div className="mt-4 bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500">Potential earnings ({totalSeats} seats)</p>
                  <p className="text-sm font-bold text-teal-600">{TAKA}{Number(pricePerSeat) * totalSeats}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <div onClick={() => setGenderSafe(!genderSafe)}
                  className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all ${genderSafe ? "bg-pink-500 border-pink-500" : "border-gray-300"}`}>
                  {genderSafe && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Female passengers only</p>
                  <p className="text-xs text-gray-400 mt-0.5">Only female students can see and join this ride</p>
                </div>
              </label>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Notes <span className="font-normal normal-case">(optional)</span>
              </p>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                maxLength={300} rows={2}
                placeholder="e.g. I'll wait 5 mins at the gate."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 resize-none"/>
              <p className="text-xs text-gray-400 text-right mt-1">{notes.length}/300</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-all">
                Back
              </button>
              <button onClick={() => setStep(3)}
                disabled={!departureTime || !pricePerSeat || (!selectedPreset && (!origin || !destination))}
                className="flex-[2] py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all">
                Review Ride
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-teal-600 px-6 py-5">
                <p className="text-teal-200 text-xs font-medium mb-1">Your ride summary</p>
                <h2 className="text-white text-lg font-bold">
                  {selectedPreset ? selectedPreset.label : `${origin} to ${destination}`}
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  ["Pickup",   origin],
                  ["Drop-off", destination],
                  ["Departure", new Date(departureTime).toLocaleString("en-BD", {
                    weekday: "short", month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit"
                  })],
                  ["Seats available", totalSeats],
                ].map(([label, value]) => (
                  <div key={label} className="px-6 py-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                  </div>
                ))}
                <div className="px-6 py-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Price per seat</span>
                  <span className="text-sm font-bold text-teal-600">{TAKA}{pricePerSeat}</span>
                </div>
                <div className="px-6 py-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Gender safe</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    genderSafe ? "bg-pink-50 text-pink-600 border border-pink-200" : "bg-gray-100 text-gray-500"
                  }`}>
                    {genderSafe ? "Female only" : "Everyone"}
                  </span>
                </div>
                {notes && (
                  <div className="px-6 py-4 flex items-start justify-between gap-4">
                    <span className="text-sm text-gray-500 flex-shrink-0">Notes</span>
                    <span className="text-sm text-gray-700 text-right">{notes}</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 transition-all">
                Edit
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-[2] py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all">
                {submitting ? "Posting..." : "Post Ride"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}