import { useState, useEffect } from "react";
import { Info, AlertTriangle, AlertOctagon, X } from "lucide-react";
import api from "../lib/api";

const CATEGORY_CONFIG = {
  info: {
    icon: Info,
    bg: "bg-sky-50", border: "border-sky-200", strip: "bg-sky-500",
    text: "text-sky-900", sub: "text-sky-700",
    labelBg: "bg-sky-100 text-sky-700", label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50", border: "border-amber-200", strip: "bg-amber-400",
    text: "text-amber-900", sub: "text-amber-700",
    labelBg: "bg-amber-100 text-amber-700", label: "Notice",
  },
  urgent: {
    icon: AlertOctagon,
    bg: "bg-red-50", border: "border-red-200", strip: "bg-red-500",
    text: "text-red-900", sub: "text-red-700",
    labelBg: "bg-red-100 text-red-700", label: "Urgent",
  },
};

export default function AnnouncementBanner({ spotId }) {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (!spotId) return;
    api.get(`/announcements/${spotId}`)
      .then((r) => setAnnouncements(r.data.announcements || []))
      .catch(() => {});
  }, [spotId]);

  const handleDismiss = async (id) => {
    setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    try { await api.post(`/announcements/${id}/dismiss`); } catch { /* silent */ }
  };

  if (announcements.length === 0) return null;

  return (
    <div className="space-y-2 mb-3">
      {announcements.map((a) => {
        const cfg = CATEGORY_CONFIG[a.category] || CATEGORY_CONFIG.info;
        const Icon = cfg.icon;
        return (
          <div key={a._id} className={`flex overflow-hidden rounded-xl border ${cfg.border} ${cfg.bg}`}>
            <div className={`w-1 shrink-0 ${cfg.strip}`} />
            <div className="flex items-start gap-3 px-3 py-2.5 flex-1 min-w-0">
              <Icon size={15} className={`shrink-0 mt-0.5 ${cfg.sub}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${cfg.labelBg}`}>
                    {cfg.label}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(a.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p className={`text-sm leading-snug ${cfg.text}`}>{a.message}</p>
              </div>
              <button onClick={() => handleDismiss(a._id)} className="text-stone-400 hover:text-stone-600 transition-colors shrink-0 mt-0.5">
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}