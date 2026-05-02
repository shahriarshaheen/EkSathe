import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star } from "lucide-react";
import api from "../lib/api";
import { toast } from "sonner";

const QUICK_COMMENTS = {
  carpool_driver: [
    "Great driver!",
    "Very punctual",
    "Safe driving",
    "Friendly",
    "Would ride again",
  ],
  carpool_passenger: [
    "Very punctual",
    "Easy to find",
    "Polite & friendly",
    "Would ride with again",
    "Smooth experience",
  ],
  homeowner: [
    "Great spot!",
    "Easy access",
    "Exactly as described",
    "Very responsive",
    "Would book again",
  ],
  tenant: [
    "Left spot clean",
    "Punctual",
    "Easy transaction",
    "Polite",
    "Would host again",
  ],
};

export default function RatingModal({
  ratedUser,
  contextType,
  contextId,
  ratedRole,
  onClose,
  onSuccess,
}) {
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [activeChip, setActiveChip] = useState(""); // track chip separately
  const [submitting, setSubmitting] = useState(false);

  const quickOptions = QUICK_COMMENTS[`${contextType}_${ratedRole}`] || [];
  const displayed = hovered || score;
  const labels = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

  const handleChipClick = (opt) => {
    if (activeChip === opt) {
      // Deselect chip — restore custom comment if any
      setActiveChip("");
      setComment("");
    } else {
      setActiveChip(opt);
      setComment(opt);
    }
  };

  const handleCustomComment = (val) => {
    setActiveChip(""); // clear chip when typing custom
    setComment(val);
  };

  const handleSubmit = async () => {
    if (score === 0) {
      toast.error("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/ratings", {
        ratedUserId: ratedUser._id,
        contextType,
        contextId,
        ratedRole,
        score,
        comment: comment.trim(),
      });
      toast.success(`Rating submitted for ${ratedUser.name}`);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Could not submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* User info */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-teal-50 border-2 border-teal-100 flex items-center justify-center">
              {ratedUser.photoUrl ? (
                <img
                  src={ratedUser.photoUrl}
                  alt={ratedUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-teal-600">
                  {ratedUser.name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            <div className="text-center">
              <p className="font-bold text-stone-900">{ratedUser.name}</p>
              <p className="text-xs text-stone-400 capitalize mt-0.5">
                Rate as {ratedRole}
              </p>
            </div>
          </div>

          {/* Stars */}
          <div className="flex flex-col items-center gap-2 mb-5">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScore(s)}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${s <= displayed ? "fill-amber-400 text-amber-400" : "fill-stone-100 text-stone-200"}`}
                  />
                </button>
              ))}
            </div>
            <p
              className={`text-sm font-bold transition-colors ${
                displayed >= 4
                  ? "text-teal-600"
                  : displayed >= 3
                    ? "text-amber-500"
                    : displayed > 0
                      ? "text-red-400"
                      : "text-stone-300"
              }`}
            >
              {displayed ? labels[displayed] : "Tap to rate"}
            </p>
          </div>

          {/* Quick comment chips */}
          {quickOptions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {quickOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleChipClick(opt)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    activeChip === opt
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-stone-50 text-stone-600 border-stone-200 hover:border-teal-400 hover:text-teal-600"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Custom comment — always editable, independent of chips */}
          <textarea
            value={activeChip ? "" : comment}
            onChange={(e) => handleCustomComment(e.target.value)}
            placeholder={
              activeChip
                ? `Using: "${activeChip}" — type here to write custom instead`
                : "Add a personal note... (optional)"
            }
            rows={2}
            maxLength={200}
            className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 resize-none hover:border-stone-300 transition-colors mb-4"
          />

          <button
            onClick={handleSubmit}
            disabled={submitting || score === 0}
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
