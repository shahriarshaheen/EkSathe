import { useState, useEffect } from "react";
import api from "../lib/api";

const UNIVERSITIES = [
  "All", "Dhaka University", "BUET", "NSU", "BRAC University",
  "IUB", "East West University", "MIST", "UIU", "AIUB",
  "Jahangirnagar University", "Stamford University",
];

export default function UniversityRouteDropdown({ onRouteSelect, disabled = false }) {
  const [presets, setPresets]     = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [uniFilter, setUniFilter] = useState("All");
  const [selected, setSelected]   = useState("");

  useEffect(() => {
    api
      .get("/carpool/presets")
      .then((r) => { setPresets(r.data.data); setFiltered(r.data.data); })
      .catch(() => setPresets([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(uniFilter === "All" ? presets : presets.filter((r) => r.university === uniFilter));
    setSelected("");
    onRouteSelect(null);
  }, [uniFilter, presets]);

  const handleChange = (e) => {
    const id = e.target.value;
    setSelected(id);
    if (!id) { onRouteSelect(null); return; }
    const route = presets.find((r) => r.id === id);
    if (route) onRouteSelect(route);
  };

  return (
    <div className="flex flex-col gap-2">

      {/* University filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {UNIVERSITIES.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUniFilter(u)}
            className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              uniFilter === u
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Route dropdown */}
      <select
        value={selected}
        onChange={handleChange}
        disabled={disabled || loading}
        className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800
                   focus:outline-none focus:ring-2 focus:ring-emerald-500
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">
          {loading ? "Loading routes..." : `— Select a route${uniFilter !== "All" ? ` to ${uniFilter}` : ""} —`}
        </option>
        {filtered.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label} (~{r.estimatedKm} km)
          </option>
        ))}
      </select>

      {/* Selected route detail */}
      {selected && (() => {
        const p = presets.find((r) => r.id === selected);
        return p ? (
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
            <span className="text-xs text-gray-500">{p.origin.name}</span>
            <span className="text-gray-300 text-xs">to</span>
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500"/>
            <span className="text-xs text-gray-500">{p.destination.name}</span>
            <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
              ~{p.estimatedKm} km
            </span>
          </div>
        ) : null;
      })()}
    </div>
  );
}