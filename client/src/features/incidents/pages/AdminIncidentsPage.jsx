import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ShieldAlert,
  LayoutDashboard,
  UserCheck,
  Car,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { getIncidents } from "../../../services/incidentService";
import api from "../../../lib/api";
import DashboardLayout from "../../../components/ui/DashboardLayout";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/dashboard/verifications", label: "Verifications", icon: UserCheck },
  { path: "/dashboard/admin/carpool", label: "Carpool Rides", icon: Car },
  { path: "/admin/incidents", label: "Incidents", icon: ShieldAlert },
  { path: "/dashboard/admin/users", label: "User Management", icon: Users },
];

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  reviewed: "bg-teal-100 text-teal-700",
  resolved: "bg-stone-100 text-stone-600",
};

const CATEGORY_LABELS = {
  harassment: "Harassment",
  unsafe_driving: "Unsafe Driving",
  theft: "Theft",
  suspicious_activity: "Suspicious Activity",
  other: "Other",
};

function IncidentRow({ incident, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(incident.status);
  const [adminNote, setAdminNote] = useState(incident.adminNote || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/incidents/${incident._id}/status`, {
        status,
        adminNote,
      });
      onUpdate(incident._id, { status, adminNote });
      toast.success("Incident updated");
      setExpanded(false);
    } catch {
      toast.error("Failed to update incident");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      {/* Summary row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 min-w-0">
          <p className="text-sm font-semibold text-stone-800 truncate">
            {CATEGORY_LABELS[incident.category] || incident.category}
          </p>
          <p className="text-xs text-stone-500 truncate col-span-2">
            {incident.description}
          </p>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-full w-fit ${STATUS_STYLES[status]}`}
          >
            {status}
          </span>
        </div>
        <p className="text-xs text-stone-400 flex-shrink-0 hidden sm:block">
          {new Date(incident.createdAt).toLocaleDateString()}
        </p>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors flex-shrink-0"
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-stone-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-500" />
          )}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-stone-100 px-4 py-4 bg-stone-50 space-y-4">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
              Full Description
            </p>
            <p className="text-sm text-stone-700 leading-relaxed">
              {incident.description}
            </p>
          </div>
          {incident.location && (
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
                Location
              </p>
              <p className="text-sm text-stone-700">{incident.location}</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">
                Update Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">
                Admin Note (visible to reporter)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={2}
                placeholder="Add a response note..."
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-stone-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getIncidents()
      .then((res) => setIncidents(res.data))
      .catch(() => toast.error("Failed to load incidents"))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = (id, updates) => {
    setIncidents((prev) =>
      prev.map((i) => (i._id === id ? { ...i, ...updates } : i)),
    );
  };

  const filtered =
    filter === "all" ? incidents : incidents.filter((i) => i.status === filter);

  const counts = {
    all: incidents.length,
    pending: incidents.filter((i) => i.status === "pending").length,
    reviewed: incidents.filter((i) => i.status === "reviewed").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS}>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-rose-50 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-800">
              Incident Reports
            </h1>
            <p className="text-sm text-stone-500">
              Reporter identities are anonymous
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-6">
          {["all", "pending", "reviewed", "resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                filter === f
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {f}
              {counts[f] > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                    filter === f
                      ? "bg-stone-100 text-stone-600"
                      : "bg-stone-200 text-stone-500"
                  }`}
                >
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-stone-400 text-sm">
            <div className="w-4 h-4 border-2 border-stone-300 border-t-transparent rounded-full animate-spin" />
            Loading incidents...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
            <ShieldAlert className="w-10 h-10 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-500 text-sm font-semibold">
              No {filter === "all" ? "" : filter} incidents
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((incident) => (
              <IncidentRow
                key={incident._id}
                incident={incident}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
