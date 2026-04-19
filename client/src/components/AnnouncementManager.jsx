import { useState, useEffect } from "react";
import { Megaphone, Plus, Trash2, Info, AlertTriangle, AlertOctagon, X, ChevronDown } from "lucide-react";
import api from "../lib/api";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "info",    label: "ℹ️ Info" },
  { value: "warning", label: "⚠️ Notice" },
  { value: "urgent",  label: "🚨 Urgent" },
];

const CATEGORY_STYLES = {
  info:    { bg: "bg-sky-50",   border: "border-sky-200",   text: "text-sky-800",   badge: "bg-sky-100 text-sky-700",   icon: Info },
  warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", badge: "bg-amber-100 text-amber-700", icon: AlertTriangle },
  urgent:  { bg: "bg-red-50",   border: "border-red-200",   text: "text-red-800",   badge: "bg-red-100 text-red-700",   icon: AlertOctagon },
};

export default function AnnouncementManager() {
  const [spots, setSpots] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("info");
  const charsLeft = 200 - message.length;

  useEffect(() => {
    Promise.all([
      api.get("/parking/my/listings"),
      api.get("/announcements/homeowner/all"),
    ])
      .then(([spotsRes, annRes]) => {
        const spotList = spotsRes.data.spots || [];
        setSpots(spotList);
        if (spotList.length > 0) setSelectedSpot(spotList[0]._id);
        setAnnouncements(annRes.data.announcements || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePost = async () => {
    if (!message.trim()) return toast.error("Please write a message.");
    if (!selectedSpot) return toast.error("Please select a spot.");
    setPosting(true);
    try {
      const { data } = await api.post(`/announcements/${selectedSpot}`, { message: message.trim(), category });
      setAnnouncements((prev) => [data.announcement, ...prev]);
      setMessage("");
      setCategory("info");
      setShowForm(false);
      const n = data.notified || 0;
      toast.success(n > 0 ? `Posted! ${n} student${n !== 1 ? "s" : ""} notified by email.` : "Announcement posted.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    try { await api.delete(`/announcements/${id}`); toast.success("Deleted."); }
    catch { toast.error("Failed to delete."); }
  };



if (loading) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 animate-pulse">
      <div className="h-4 bg-stone-100 rounded w-1/3 mb-4" />
      <div className="h-16 bg-stone-100 rounded" />
    </div>
  );
}

if (spots.length === 0) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-stone-100">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
          <Megaphone size={16} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-stone-900">Announcement Board</h3>
          <p className="text-xs text-stone-400">Notify students about spot changes</p>
        </div>
      </div>

      <div className="px-5 py-8 text-center">
        <Megaphone size={28} className="mx-auto text-stone-200 mb-2" />
        <p className="text-sm text-stone-500">No parking spots yet</p>
        <p className="text-xs text-stone-400 mt-1">
          Create a spot first to post announcements.
        </p>
      </div>
    </div>
  );
}
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Megaphone size={16} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Announcement Board</h3>
            <p className="text-xs text-stone-400">Notify students about spot changes</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold bg-stone-900 text-white px-3 py-1.5 rounded-lg hover:bg-stone-700 transition-colors"
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? "Cancel" : "Post"}
        </button>
      </div>

      {/* Post form */}
      {showForm && (
        <div className="px-5 py-4 bg-stone-50 border-b border-stone-100 space-y-3">
          {spots.length > 1 && (
            <div>
              <label className="text-xs font-medium text-stone-500 mb-1 block">Spot</label>
              <div className="relative">
                <select
                  value={selectedSpot}
                  onChange={(e) => setSelectedSpot(e.target.value)}
                  className="w-full appearance-none bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 pr-8 focus:outline-none focus:ring-2 focus:ring-stone-900"
                >
                  {spots.map((s) => <option key={s._id} value={s._id}>{s.title}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-stone-500 mb-1.5 block">Type</label>
            <div className="flex gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-xl border transition-all ${
                    category === c.value
                      ? "bg-stone-900 text-white border-stone-900"
                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-stone-500 mb-1 block">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 200))}
              placeholder={
                category === "urgent" ? "e.g. Spot unavailable today due to emergency"
                : category === "warning" ? "e.g. Road blocked next week — use side entrance"
                : "e.g. Gate code changed to 4521"
              }
              rows={3}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 resize-none focus:outline-none focus:ring-2 focus:ring-stone-900 placeholder-stone-300"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-stone-400">Students who booked will get an email</span>
              <span className={`text-xs ${charsLeft < 20 ? "text-red-500" : "text-stone-400"}`}>{charsLeft} left</span>
            </div>
          </div>
          <button
            onClick={handlePost}
            disabled={posting || !message.trim()}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
          >
            {posting
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Megaphone size={14} />}
            {posting ? "Posting…" : "Post Announcement"}
          </button>
        </div>
      )}

      {/* List */}
      <div className="divide-y divide-stone-100">
        {announcements.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <Megaphone size={28} className="mx-auto text-stone-200 mb-2" />
            <p className="text-sm text-stone-400">No active announcements</p>
            <p className="text-xs text-stone-300 mt-1">Post one to notify your bookers instantly</p>
          </div>
        ) : (
          announcements.map((a) => {
            const cfg = CATEGORY_STYLES[a.category] || CATEGORY_STYLES.info;
            const Icon = cfg.icon;
            const spotName = a.spotId?.title || "Your spot";
            return (
              <div key={a._id} className="flex items-start gap-3 px-5 py-3.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg} ${cfg.border} border`}>
                  <Icon size={13} className={cfg.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${cfg.badge}`}>
                      {a.category === "info" ? "Info" : a.category === "warning" ? "Notice" : "Urgent"}
                    </span>
                    <span className="text-xs text-stone-400 truncate">{spotName}</span>
                  </div>
                  <p className="text-sm text-stone-800 leading-snug">{a.message}</p>
                  <p className="text-xs text-stone-400 mt-1">
                    {new Date(a.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}expires {new Date(a.expiresAt).toLocaleDateString("en-BD", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <button onClick={() => handleDelete(a._id)} className="text-stone-300 hover:text-red-500 transition-colors shrink-0 mt-1">
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}