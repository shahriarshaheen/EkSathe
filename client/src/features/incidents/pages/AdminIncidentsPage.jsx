import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { getIncidents, updateIncidentStatus } from "../../../services/incidentService";
import DashboardLayout from "../../../components/ui/DashboardLayout";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Overview", icon: ShieldAlert },
  { path: "/admin/incidents", label: "Incidents", icon: ShieldAlert },
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

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getIncidents();
        setIncidents(res.data);
      } catch {
        toast.error("Failed to load incidents");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateIncidentStatus(id, status);
      setIncidents((prev) =>
        prev.map((i) => (i._id === id ? { ...i, status } : i))
      );
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-800">Incident Reports</h1>
            <p className="text-sm text-stone-500">Reporter identities are hidden</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-stone-400 text-sm">
            <div className="w-4 h-4 border-2 border-stone-300 border-t-transparent rounded-full animate-spin" />
            Loading incidents...
          </div>
        ) : incidents.length === 0 ? (
          <p className="text-stone-500 text-sm">No incidents reported yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-stone-600 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {incidents.map((incident) => (
                  <tr key={incident._id} className="bg-white hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-stone-700">
                      {CATEGORY_LABELS[incident.category] || incident.category}
                    </td>
                    <td className="px-4 py-3 text-stone-600 max-w-xs">
                      <p className="truncate">{incident.description}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-500">
                      {incident.location || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${STATUS_STYLES[incident.status]}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={incident.status}
                        onChange={(e) => handleStatusChange(incident._id, e.target.value)}
                        className="border border-stone-200 rounded-lg px-2 py-1 text-xs
                          text-stone-700 bg-white hover:border-stone-300 focus:outline-none
                          focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600
                          transition-colors"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}