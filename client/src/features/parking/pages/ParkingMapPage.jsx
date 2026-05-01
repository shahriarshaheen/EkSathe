import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  ArrowLeft,
  Navigation,
  X,
  Clock,
  Calendar,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { parkingService } from "../../../services/parkingService";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const parkingIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DAY_LABELS = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const ALL_DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const FlyToLocation = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { animate: true, duration: 1.5 });
  }, [position, map]);
  return null;
};

const ParkingMapPage = () => {
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [flyTo, setFlyTo] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [locating, setLocating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [searchText, setSearchText] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");

  // Debounce ref for search text
  const debounceRef = useRef(null);

  const defaultCenter = [23.8103, 90.4125];

  // Build query params from current filter state
  const buildParams = (overrides = {}) => {
    const state = {
      search: searchText,
      priceMin,
      priceMax,
      availableDay: selectedDay,
      availableFrom: timeFrom,
      availableTo: timeTo,
      ...overrides,
    };
    const params = {};
    if (state.search.trim()) params.search = state.search.trim();
    if (state.priceMin !== "") params.priceMin = state.priceMin;
    if (state.priceMax !== "") params.priceMax = state.priceMax;
    if (state.availableDay) params.availableDay = state.availableDay;
    if (state.availableFrom) params.availableFrom = state.availableFrom;
    if (state.availableTo) params.availableTo = state.availableTo;
    return params;
  };

  const fetchSpots = async (params = {}) => {
    setLoading(true);
    try {
      const res = await parkingService.getSpots(params);
      setSpots(res.data.spots || []);
    } catch (err) {
      toast.error("Could not load parking spots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  // Debounced search text effect
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSpots(buildParams({ search: searchText }));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchText]);

  const handleApplyFilters = () => {
    fetchSpots(buildParams());
  };

  const handleClearAll = () => {
    setSearchText("");
    setPriceMin("");
    setPriceMax("");
    setSelectedDay("");
    setTimeFrom("");
    setTimeTo("");
    fetchSpots({});
  };

  const hasActiveFilters =
    searchText || priceMin || priceMax || selectedDay || timeFrom || timeTo;

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setFlyTo([latitude, longitude]);
        toast.success("Showing spots near your location.");
        setLocating(false);
      },
      () => {
        toast.error("Could not detect your location.");
        setLocating(false);
      }
    );
  };

  return (
    <div className="h-screen flex flex-col bg-stone-50">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-teal-600 rounded-md flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-stone-900 tracking-tight text-sm">EkSathe</span>
          </div>
          <span className="text-stone-300">·</span>
          <span className="text-sm font-medium text-stone-600">Find Parking</span>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-stone-400">
              {loading ? "Loading..." : `${spots.length} spot${spots.length !== 1 ? "s" : ""} available`}
            </span>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-teal-50 border-teal-300 text-teal-700"
                  : "bg-white border-stone-200 text-stone-600 hover:border-stone-300"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              )}
            </button>
            <button
              onClick={detectLocation}
              disabled={locating}
              className="flex items-center gap-1.5 bg-stone-900 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              <Navigation className="w-3.5 h-3.5" />
              {locating ? "Locating..." : "Near me"}
            </button>
          </div>
        </div>

        {/* Search bar — always visible below header */}
        <div className="border-t border-stone-100 px-4 py-2 bg-white">
          <div className="max-w-7xl mx-auto relative flex items-center">
            <Search className="absolute left-3 w-3.5 h-3.5 text-stone-400" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by title or address..."
              className="w-full pl-9 pr-8 py-2 text-sm text-stone-900 placeholder-stone-400 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 hover:border-stone-300 transition-colors"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden border-t border-stone-100 bg-stone-50"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
                {/* Price range */}
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Price Range (৳/day)
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="Min"
                      min={0}
                      className="w-24 px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 bg-white"
                    />
                    <span className="text-stone-400 text-sm">—</span>
                    <input
                      type="number"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="Max"
                      min={0}
                      className="w-24 px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 bg-white"
                    />
                  </div>
                </div>

                {/* Day picker */}
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Available Day
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_DAYS.map((day) => (
                      <button
                        key={day}
                        onClick={() =>
                          setSelectedDay(selectedDay === day ? "" : day)
                        }
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          selectedDay === day
                            ? "bg-teal-600 border-teal-600 text-white"
                            : "bg-white border-stone-200 text-stone-600 hover:border-teal-400 hover:text-teal-600"
                        }`}
                      >
                        {DAY_LABELS[day]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time range */}
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Available Hours
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <input
                        type="time"
                        value={timeFrom}
                        onChange={(e) => setTimeFrom(e.target.value)}
                        className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 bg-white"
                      />
                    </div>
                    <span className="text-stone-400 text-sm">—</span>
                    <input
                      type="time"
                      value={timeTo}
                      onChange={(e) => setTimeTo(e.target.value)}
                      className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 bg-white"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleApplyFilters}
                    className="bg-stone-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-stone-800 transition-colors"
                  >
                    Apply Filters
                  </button>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAll}
                      className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors px-3 py-2.5"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Map + Side panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={defaultCenter}
            zoom={13}
            className="w-full h-full"
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {flyTo && <FlyToLocation position={flyTo} />}
            {userLocation && (
              <Marker position={userLocation} icon={userIcon}>
                <Popup>
                  <div className="text-sm font-medium text-stone-800">Your location</div>
                </Popup>
              </Marker>
            )}
            {spots.map((spot) => {
              const [lng, lat] = spot.location.coordinates;
              return (
                <Marker
                  key={spot._id}
                  position={[lat, lng]}
                  icon={parkingIcon}
                  eventHandlers={{ click: () => setSelectedSpot(spot) }}
                >
                  <Popup>
                    <div className="min-w-[180px]">
                      <p className="font-semibold text-stone-900 text-sm mb-1">{spot.title}</p>
                      <p className="text-xs text-stone-500 mb-2">{spot.address}</p>
                      <p className="text-sm font-bold text-teal-600 mb-2">৳{spot.pricePerDay}/day</p>
                      <button
                        onClick={() => setSelectedSpot(spot)}
                        className="w-full bg-stone-900 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-stone-800 transition-colors"
                      >
                        View details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>

          {loading && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-3 shadow-sm border border-stone-200">
                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-stone-600">Loading spots...</span>
              </div>
            </div>
          )}

          {!loading && spots.length === 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-white rounded-xl px-5 py-3 shadow-sm border border-stone-200 text-center">
                <p className="text-sm font-medium text-stone-700">No parking spots found</p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {hasActiveFilters ? "Try adjusting your filters" : "Be the first to list a spot"}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="mt-2 text-xs font-bold text-teal-600 hover:text-teal-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        {selectedSpot && (
          <div className="w-80 flex-shrink-0 bg-white border-l border-stone-200 overflow-y-auto flex flex-col">
            <div className="relative aspect-video bg-stone-100 flex-shrink-0">
              {selectedSpot.photos?.length > 0 ? (
                <img
                  src={selectedSpot.photos[0].url}
                  alt={selectedSpot.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-stone-300" />
                </div>
              )}
              <button
                onClick={() => setSelectedSpot(null)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 flex-1">
              <div>
                <h2 className="font-bold text-stone-900 text-base leading-snug mb-1">
                  {selectedSpot.title}
                </h2>
                <p className="text-xs text-stone-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {selectedSpot.address}
                </p>
              </div>

              {selectedSpot.description && (
                <p className="text-sm text-stone-600 leading-relaxed">{selectedSpot.description}</p>
              )}

              <div className="bg-teal-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-teal-700 font-medium">Price per day</span>
                <span className="text-xl font-bold text-teal-700">৳{selectedSpot.pricePerDay}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Clock className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <span>{selectedSpot.availableFrom} – {selectedSpot.availableTo}</span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="w-4 h-4 text-stone-400" />
                  <span className="text-xs font-medium text-stone-500">Available days</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSpot.availableDays?.map((day) => (
                    <span
                      key={day}
                      className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium"
                    >
                      {DAY_LABELS[day]}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Spot type</span>
                <span className="font-medium text-stone-800 capitalize">{selectedSpot.spotType}</span>
              </div>

              {selectedSpot.owner && (
                <div className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-stone-600">
                      {selectedSpot.owner.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{selectedSpot.owner.name}</p>
                    <p className="text-xs text-stone-400">Trust score: {selectedSpot.owner.trustScore}</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate(`/dashboard/book-spot/${selectedSpot._id}`)}
                className="w-full bg-stone-900 text-white font-semibold py-3 rounded-xl hover:bg-stone-800 transition-colors mt-auto"
              >
                Book this spot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParkingMapPage;