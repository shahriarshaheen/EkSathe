import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  GraduationCap,
  Search,
  Filter,
} from "lucide-react";
import api from "../../../lib/api";
import { getUniversityById } from "../../../constants/universities";

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
        {/* Avatar */}
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

        {/* Info */}
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
              <UserCheck className="w-3 h-3" />
              ID:{" "}
              <span className="font-mono font-semibold">
                {student.studentId || "Not provided"}
              </span>
            </span>
            {university && (
              <span className="flex items-center gap-1 text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-lg">
                <GraduationCap className="w-3 h-3" />
                {university.name}
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

      {/* Actions — only for pending */}
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

      {/* Re-review option for rejected */}
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
  const navigate = useNavigate();
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

      // Fetch counts for all tabs
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
    } catch (err) {
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
      toast.success("Student verification rejected.");
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
    <div className="min-h-screen bg-stone-50">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-3">
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
            Student Verifications
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Student Verifications
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Review and verify student ID submissions.
          </p>
        </div>

        {/* Stats */}
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
              className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${
                tab === t
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {t}
              {counts[t] > 0 && (
                <span
                  className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    tab === t
                      ? "bg-stone-100 text-stone-600"
                      : "bg-stone-200 text-stone-500"
                  }`}
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

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <UserCheck className="w-10 h-10 text-stone-200 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-600 mb-1">
              No {tab} verifications
            </p>
            <p className="text-xs text-stone-400">
              {tab === "pending"
                ? "All student submissions have been reviewed."
                : `No ${tab} students found.`}
            </p>
          </div>
        )}

        {/* Student cards */}
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
      </main>
    </div>
  );
};

export default VerificationsPage;
