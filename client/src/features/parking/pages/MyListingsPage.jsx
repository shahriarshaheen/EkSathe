import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  MapPin,
  PlusCircle,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Clock,
  Calendar,
  BadgeDollarSign,
} from "lucide-react";
import { parkingService } from "../../../services/parkingService";
import Button from "../../../components/ui/Button";

const DAY_LABELS = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const SpotCard = ({ spot, onDelete, onToggle }) => {
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Delete this listing permanently?")) return;
    setDeleting(true);
    await onDelete(spot._id);
    setDeleting(false);
  };

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(spot._id, !spot.isActive);
    setToggling(false);
  };

  return (
    <div
      className={`bg-white rounded-xl border transition-all ${
        spot.isActive ? "border-stone-200" : "border-stone-100 opacity-60"
      }`}
    >
      {/* Photo */}
      <div className="relative aspect-video rounded-t-xl overflow-hidden bg-stone-100">
        {spot.photos?.length > 0 ? (
          <img
            src={spot.photos[0].url}
            alt={spot.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-stone-300" />
          </div>
        )}
        {/* Status badge */}
        <span
          className={`absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
            spot.isActive
              ? "bg-green-100 text-green-700"
              : "bg-stone-100 text-stone-500"
          }`}
        >
          {spot.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-stone-900 text-sm leading-snug mb-1">
          {spot.title}
        </h3>
        <p className="text-xs text-stone-400 mb-3 flex items-center gap-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {spot.address}
        </p>

        <div className="flex items-center gap-3 mb-3 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <BadgeDollarSign className="w-3 h-3" />৳{spot.pricePerDay}/day
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {spot.availableFrom} – {spot.availableTo}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {spot.availableDays?.map((day) => (
            <span
              key={day}
              className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded font-medium"
            >
              {DAY_LABELS[day]}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
          <button
            onClick={handleToggle}
            disabled={toggling}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors disabled:opacity-50"
          >
            {spot.isActive ? (
              <ToggleRight className="w-4 h-4 text-teal-600" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            {spot.isActive ? "Deactivate" : "Activate"}
          </button>

          <div className="flex-1" />

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1 text-xs font-medium text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

const MyListingsPage = () => {
  const navigate = useNavigate();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMySpots();
  }, []);

  const fetchMySpots = async () => {
    setLoading(true);
    try {
      const res = await parkingService.getMySpots();
      setSpots(res.data.spots || []);
    } catch (err) {
      toast.error("Could not load your listings.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await parkingService.deleteSpot(id);
      setSpots((prev) => prev.filter((s) => s._id !== id));
      toast.success("Listing deleted.");
    } catch (err) {
      toast.error("Could not delete listing.");
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      const formData = new FormData();
      formData.append("isActive", isActive);
      await parkingService.updateSpot(id, formData);
      setSpots((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isActive } : s)),
      );
      toast.success(isActive ? "Listing activated." : "Listing deactivated.");
    } catch (err) {
      toast.error("Could not update listing.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
              <span className="font-bold text-stone-900 tracking-tight text-sm">
                EkSathe
              </span>
            </div>
            <span className="text-stone-300">·</span>
            <span className="text-sm font-medium text-stone-600">
              My Listings
            </span>
          </div>
          <Button
            onClick={() => navigate("/dashboard/create-listing")}
            className="flex items-center gap-1.5 text-sm py-2 px-4"
          >
            <PlusCircle className="w-4 h-4" />
            Add listing
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-stone-900">{spots.length}</p>
            <p className="text-xs text-stone-400 mt-0.5">Total listings</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-teal-600">
              {spots.filter((s) => s.isActive).length}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">Active</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <p className="text-2xl font-bold text-stone-400">
              {spots.filter((s) => !s.isActive).length}
            </p>
            <p className="text-xs text-stone-400 mt-0.5">Inactive</p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && spots.length === 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <div className="w-14 h-14 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-stone-300" />
            </div>
            <h3 className="font-semibold text-stone-800 mb-1">
              No listings yet
            </h3>
            <p className="text-sm text-stone-400 mb-6">
              List your first parking spot and start earning.
            </p>
            <Button onClick={() => navigate("/dashboard/create-listing")}>
              Add your first listing
            </Button>
          </div>
        )}

        {/* Listings grid */}
        {!loading && spots.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {spots.map((spot) => (
              <SpotCard
                key={spot._id}
                spot={spot}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyListingsPage;
