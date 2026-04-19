import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  GraduationCap,
  Search,
  LayoutDashboard,
  Car,
  ShieldAlert,
  Users,
} from "lucide-react";
import api from "../../../lib/api";
import DashboardLayout from "../../../components/ui/DashboardLayout";
import { getUniversityById } from "../../../constants/universities";

// Unified admin nav — same on all admin pages
const NAV_ITEMS = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/dashboard/verifications", label: "Verifications", icon: UserCheck },
  { path: "/dashboard/admin/carpool", label: "Carpool Rides", icon: Car },
  { path: "/admin/incidents", label: "Incidents", icon: ShieldAlert },
  { path: "/dashboard/admin/users", label: "User Management", icon: Users },
];

const statusTabs = ["pending", "approved", "rejected"];

const StudentCard = ({ student, onApprove, onReject, tab }) => {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState("");
  const university = student.university
    ? getUniversityById(student.university)
    : null;

  const handleApprove = async () => {
    setApproving(true);
    await onApprove(student._id);
    setApproving(false);
  };
  const handleReject = async () => {
    setRejecting(true);
    await onReject(student._id, reason);
    setRejecting(false);
    setShowRejectForm(false);
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-stone-100 flex-shrink-0">
          {student.photoUrl ? (
            <img
              src={student.photoUrl}
              alt={student.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-sm font-bold text-stone-500">
                {student.name[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-stone-900 text-sm">
              {student.name}
            </p>
            {tab === "approved" && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 flex-shrink-0">
                <CheckCircle className="w-3 h-3" /> Verified
              </span>
            )}
            {tab === "rejected" && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 flex-shrink-0">
                <XCircle className="w-3 h-3" /> Rejected
              </span>
            )}
            {tab === "pending" && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3" /> Pending
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400 mb-2">{student.email}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="flex items-center gap-1 text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-lg">
              <UserCheck className="w-3 h-3" /> ID:{" "}
              <span className="font-mono font-semibold">
                {student.studentId || "Not provided"}
              </span>
            </span>
            {university && (
              <span className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-lg">
                <GraduationCap className="w-3 h-3" /> {university.name}
              </span>
            )}
          </div>
          <p className="text-xs text-stone-400">
            Registered{" "}
            {new Date(student.createdAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {tab === "pending" && (
        <div className="mt-4 pt-4 border-t border-stone-100">
          {!showRejectForm ? (
            <div className="flex gap-2">
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <UserCheck className="w-4 h-4" />
                {approving ? "Approving..." : "Approve"}
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 text-sm font-semibold py-2 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
              >
                <UserX className="w-4 h-4" />
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Reason for rejection (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={rejecting}
                  className="flex-1 bg-red-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {rejecting ? "Rejecting..." : "Confirm rejection"}
                </button>
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setReason("");
                  }}
                  className="px-4 bg-stone-100 text-stone-600 text-sm font-medium py-2 rounded-lg hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "rejected" && (
        <div className="mt-4 pt-4 border-t border-stone-100">
          <button
            onClick={handleApprove}
            disabled={approving}
            className="w-full flex items-center justify-center gap-1.5 bg-green-50 text-green-700 text-sm font-semibold py-2 rounded-lg hover:bg-green-100 transition-colors border border-green-200 disabled:opacity-50"
          >
            <UserCheck className="w-4 h-4" />
            {approving ? "Approving..." : "Approve after review"}
          </button>
        </div>
      )}
    </div>
  );
};

const VerificationsPage = () => {
  const [tab, setTab] = useState("pending");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchStudents();
  }, [tab]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/students?status=${tab}`);
      setStudents(res.data.students || []);
      const [p, a, r] = await Promise.all([
        api.get("/admin/students?status=pending"),
        api.get("/admin/students?status=approved"),
        api.get("/admin/students?status=rejected"),
      ]);
      setCounts({
        pending: p.data.students?.length || 0,
        approved: a.data.students?.length || 0,
        rejected: r.data.students?.length || 0,
      });
    } catch {
      toast.error("Could not load students.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/students/${id}/approve`);
      toast.success("Student verified successfully.");
      fetchStudents();
    } catch (err) {
      toast.error(err.message || "Could not approve student.");
    }
  };
  const handleReject = async (id, reason) => {
    try {
      await api.put(`/admin/students/${id}/reject`, { reason });
      toast.success("Verification rejected.");
      fetchStudents();
    } catch (err) {
      toast.error(err.message || "Could not reject student.");
    }
  };

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.studentId || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout navItems={NAV_ITEMS}>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Student Verifications
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Review and approve student ID submissions.
          </p>
        </div>

        {/* Counts */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-700">
              {counts.pending}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">Pending</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">
              {counts.approved}
            </p>
            <p className="text-xs text-green-600 mt-0.5">Approved</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
            <p className="text-xs text-red-500 mt-0.5">Rejected</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-6">
          {statusTabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${tab === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}
            >
              {t}
              {counts[t] > 0 && (
                <span
                  className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t ? "bg-stone-100 text-stone-600" : "bg-stone-200 text-stone-500"}`}
                >
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by name, email or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <UserCheck className="w-10 h-10 text-stone-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-600 mb-1">
              No {tab} verifications
            </p>
            <p className="text-xs text-stone-400">
              {tab === "pending"
                ? "All submissions reviewed."
                : `No ${tab} students found.`}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((student) => (
              <StudentCard
                key={student._id}
                student={student}
                tab={tab}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VerificationsPage;
