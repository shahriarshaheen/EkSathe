import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Tag,
  Plus,
  Search,
  Trash2,
  ToggleLeft,
  ToggleRight,
  LayoutDashboard,
  UserCheck,
  Car,
  ShieldAlert,
  Users,
  Pencil,
  X,
} from "lucide-react";
import DashboardLayout from "../components/ui/DashboardLayout";
import api from "../lib/api";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { path: "/dashboard/verifications", label: "Verifications", icon: UserCheck },
  { path: "/dashboard/admin/carpool", label: "Carpool Rides", icon: Car },
  { path: "/admin/incidents", label: "Incidents", icon: ShieldAlert },
  { path: "/dashboard/admin/users", label: "User Management", icon: Users },
  { path: "/dashboard/admin/coupons", label: "Coupons", icon: Tag },
];

const TYPE_COLORS = {
  all: "bg-stone-100 text-stone-600",
  parking: "bg-teal-50 text-teal-700",
  carpool: "bg-blue-50 text-blue-700",
};

const EMPTY_FORM = {
  code: "",
  title: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  maxDiscountAmount: "",
  minOrderAmount: "",
  usageLimit: "",
  perUserLimit: "1",
  applicableFor: "all",
  isActive: true,
  validFrom: "",
  validUntil: "",
};

const Field = ({ label, children }) => (
  <div>
    <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide block mb-1">
      {label}
    </label>
    {children}
  </div>
);

// ── Coupon create/edit modal ──────────────────────────────────
function CouponForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, code: form.code.toUpperCase() };

      if (initial?._id) {
        await api.put(`/admin/coupons/${initial._id}`, payload);
        toast.success("Coupon updated.");
      } else {
        await api.post("/admin/coupons", payload);
        toast.success("Coupon created.");
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-colors";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-base font-bold text-stone-900">
            {initial?._id ? "Edit Coupon" : "Create Coupon"}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Code *">
              <input
                required
                value={form.code}
                onChange={(e) => set("code", e.target.value)}
                placeholder="e.g. WELCOME10"
                className={`${inputCls} font-mono uppercase`}
              />
            </Field>
            <Field label="Title *">
              <input
                required
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Coupon title"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Description">
            <input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional description"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Discount Type *">
              <select
                value={form.discountType}
                onChange={(e) => set("discountType", e.target.value)}
                className={inputCls}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (৳)</option>
              </select>
            </Field>
            <Field
              label={
                form.discountType === "percentage"
                  ? "Value (%) *"
                  : "Amount (৳) *"
              }
            >
              <input
                required
                type="number"
                min="0"
                value={form.discountValue}
                onChange={(e) => set("discountValue", e.target.value)}
                placeholder={
                  form.discountType === "percentage" ? "e.g. 10" : "e.g. 50"
                }
                className={inputCls}
              />
            </Field>
          </div>

          {form.discountType === "percentage" && (
            <Field label="Max Discount Amount (৳)">
              <input
                type="number"
                min="0"
                value={form.maxDiscountAmount}
                onChange={(e) => set("maxDiscountAmount", e.target.value)}
                placeholder="Leave blank for no cap"
                className={inputCls}
              />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Min Order Amount (৳)">
              <input
                type="number"
                min="0"
                value={form.minOrderAmount}
                onChange={(e) => set("minOrderAmount", e.target.value)}
                placeholder="0"
                className={inputCls}
              />
            </Field>
            <Field label="Usage Limit (total)">
              <input
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(e) => set("usageLimit", e.target.value)}
                placeholder="Blank = unlimited"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Per User Limit">
              <input
                type="number"
                min="1"
                value={form.perUserLimit}
                onChange={(e) => set("perUserLimit", e.target.value)}
                placeholder="1"
                className={inputCls}
              />
            </Field>
            <Field label="Applicable For">
              <select
                value={form.applicableFor}
                onChange={(e) => set("applicableFor", e.target.value)}
                className={inputCls}
              >
                <option value="all">All</option>
                <option value="parking">Parking only</option>
                <option value="carpool">Carpool only</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Valid From *">
              <input
                required
                type="datetime-local"
                value={form.validFrom}
                onChange={(e) => set("validFrom", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Valid Until *">
              <input
                required
                type="datetime-local"
                value={form.validUntil}
                onChange={(e) => set("validUntil", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={() => set("isActive", !form.isActive)}
            className={`flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl transition-all ${
              form.isActive
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-stone-100 text-stone-500 border border-stone-200"
            }`}
          >
            {form.isActive ? (
              <ToggleRight className="w-4 h-4" />
            ) : (
              <ToggleLeft className="w-4 h-4" />
            )}
            {form.isActive ? "Active" : "Inactive"}
          </button>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-stone-900 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : initial?._id
                  ? "Save Changes"
                  : "Create Coupon"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 bg-stone-100 text-stone-600 text-sm font-semibold py-2.5 rounded-xl hover:bg-stone-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [acting, setActing] = useState(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      const res = await api.get(`/admin/coupons?${params}`);
      setCoupons(res.data.data || []);
    } catch {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [statusFilter, typeFilter]);

  const handleToggle = async (coupon) => {
    setActing(coupon._id);
    try {
      await api.patch(`/admin/coupons/${coupon._id}/toggle`);
      setCoupons((prev) =>
        prev.map((c) =>
          c._id === coupon._id ? { ...c, isActive: !c.isActive } : c,
        ),
      );
      toast.success(`Coupon ${coupon.isActive ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Failed to toggle coupon");
    } finally {
      setActing(null);
    }
  };

  const handleDelete = async (coupon) => {
    if (
      !window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)
    )
      return;
    setActing(coupon._id);
    try {
      await api.delete(`/admin/coupons/${coupon._id}`);
      setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
      toast.success("Coupon deleted");
    } catch {
      toast.error("Failed to delete coupon");
    } finally {
      setActing(null);
    }
  };

  const filtered = coupons.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.code.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q)
    );
  });

  const now = new Date();

  return (
    <DashboardLayout navItems={NAV_ITEMS}>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Coupon Management
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Create and manage discount coupons for students.
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-stone-900 text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-stone-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Coupon
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchCoupons()}
              placeholder="Search by code or title..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 bg-white focus:outline-none"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-700 bg-white focus:outline-none"
          >
            <option value="all">All types</option>
            <option value="parking">Parking</option>
            <option value="carpool">Carpool</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center gap-2 text-stone-400 text-sm py-8">
            <div className="w-4 h-4 border-2 border-stone-300 border-t-transparent rounded-full animate-spin" />
            Loading coupons...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <Tag className="w-10 h-10 text-stone-200 mx-auto mb-3" />
            <p className="text-stone-500 text-sm font-semibold">
              No coupons found
            </p>
            <p className="text-stone-400 text-xs mt-1">
              Create your first coupon to get started.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-stone-50 border-b border-stone-100 text-xs font-bold text-stone-400 uppercase tracking-widest">
              <div className="col-span-3">Code / Title</div>
              <div className="col-span-2">Discount</div>
              <div className="col-span-2">Applies to</div>
              <div className="col-span-2">Validity</div>
              <div className="col-span-1">Used</div>
              <div className="col-span-2">Actions</div>
            </div>

            <div className="divide-y divide-stone-50">
              {filtered.map((coupon) => {
                const expired = new Date(coupon.validUntil) < now;
                const started = new Date(coupon.validFrom) <= now;
                const status = !coupon.isActive
                  ? "inactive"
                  : expired
                    ? "expired"
                    : !started
                      ? "upcoming"
                      : "active";
                const statusStyles = {
                  active: "bg-green-50 text-green-700",
                  inactive: "bg-stone-100 text-stone-500",
                  expired: "bg-red-50 text-red-500",
                  upcoming: "bg-amber-50 text-amber-700",
                };

                return (
                  <div
                    key={coupon._id}
                    className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-stone-50 transition-colors"
                  >
                    {/* Code + title */}
                    <div className="col-span-12 sm:col-span-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-black text-stone-900">
                          {coupon.code}
                        </span>
                        <span
                          className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${statusStyles[status]}`}
                        >
                          {status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5 truncate">
                        {coupon.title}
                      </p>
                    </div>

                    {/* Discount */}
                    <div className="col-span-4 sm:col-span-2">
                      <p className="text-sm font-bold text-teal-700">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : `৳${coupon.discountValue}`}
                      </p>
                      {coupon.discountType === "percentage" &&
                        coupon.maxDiscountAmount && (
                          <p className="text-xs text-stone-400">
                            max ৳{coupon.maxDiscountAmount}
                          </p>
                        )}
                      {coupon.minOrderAmount > 0 && (
                        <p className="text-xs text-stone-400">
                          min ৳{coupon.minOrderAmount}
                        </p>
                      )}
                    </div>

                    {/* Type */}
                    <div className="col-span-4 sm:col-span-2">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${TYPE_COLORS[coupon.applicableFor]}`}
                      >
                        {coupon.applicableFor}
                      </span>
                    </div>

                    {/* Validity */}
                    <div className="col-span-12 sm:col-span-2 text-xs text-stone-400">
                      <p>{new Date(coupon.validFrom).toLocaleDateString()}</p>
                      <p>
                        → {new Date(coupon.validUntil).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Usage */}
                    <div className="col-span-4 sm:col-span-1 text-sm text-stone-600 font-bold">
                      {coupon.usedCount}
                      {coupon.usageLimit && (
                        <span className="text-xs text-stone-400 font-normal">
                          /{coupon.usageLimit}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="col-span-8 sm:col-span-2 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditing(coupon);
                          setShowForm(true);
                        }}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggle(coupon)}
                        disabled={acting === coupon._id}
                        className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50"
                        title={coupon.isActive ? "Deactivate" : "Activate"}
                      >
                        {coupon.isActive ? (
                          <ToggleRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="w-4 h-4 text-stone-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon)}
                        disabled={acting === coupon._id}
                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <CouponForm
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={fetchCoupons}
        />
      )}
    </DashboardLayout>
  );
}
