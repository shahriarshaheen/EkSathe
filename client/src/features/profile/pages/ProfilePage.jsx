import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  MapPin,
  Camera,
  Trash2,
  User,
  Mail,
  Phone,
  GraduationCap,
  Shield,
} from "lucide-react";
import { userService } from "../../../services/userService";
import { useAuth } from "../../../context/AuthContext";
import { getUniversityById } from "../../../constants/universities";
import Button from "../../../components/ui/Button";
import FormField from "../../../components/ui/FormField";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
  });
  const [preview, setPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        gender: user.gender || "",
      });
      setPreview(user.photoUrl || null);
    }
  }, [user]);

  const university = user?.university
    ? getUniversityById(user.university)
    : null;

  // ── Photo selection ──
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5MB.");
      return;
    }

    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ── Delete photo ──
  const handleDeletePhoto = async () => {
    if (!user?.photoUrl && !photoFile) return;

    if (photoFile) {
      setPhotoFile(null);
      setPreview(user?.photoUrl || null);
      return;
    }

    setPhotoLoading(true);
    try {
      await userService.deletePhoto();
      setPreview(null);
      setUser((prev) => ({ ...prev, photoUrl: null }));
      toast.success("Profile photo removed.");
    } catch (err) {
      toast.error("Could not remove photo.");
    } finally {
      setPhotoLoading(false);
    }
  };

  // ── Validate ──
  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters";
    if (form.phone && !/^\d{10,15}$/.test(form.phone.trim()))
      errs.phone = "Phone must be 10–15 digits";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      if (form.phone) formData.append("phone", form.phone.trim());
      if (form.gender) formData.append("gender", form.gender);
      if (photoFile) formData.append("photo", photoFile);

      const res = await userService.updateProfile(formData);
      setUser((prev) => ({ ...prev, ...res.data.data }));
      setPhotoFile(null);
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.message || "Could not update profile.");
    } finally {
      setLoading(false);
    }
  };

  const roleBadgeStyle = {
    student: "bg-teal-100 text-teal-700",
    homeowner: "bg-amber-100 text-amber-700",
    admin: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center gap-3">
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
            Edit Profile
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Profile photo section */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-semibold text-stone-700 mb-5">
            Profile Photo
          </h3>
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-stone-100 border-2 border-stone-200">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-stone-400">
                      {user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* Camera button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-stone-900 rounded-full flex items-center justify-center hover:bg-stone-700 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            {/* Actions */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-800 mb-1">
                {user?.name}
              </p>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${roleBadgeStyle[user?.role]}`}
              >
                {user?.role}
              </span>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors"
                >
                  {preview ? "Change photo" : "Upload photo"}
                </button>
                {preview && (
                  <>
                    <span className="text-stone-300">·</span>
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      disabled={photoLoading}
                      className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      {photoLoading ? "Removing..." : "Remove"}
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-1">
                JPG, PNG or WebP — max 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Read-only info */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h3 className="text-sm font-semibold text-stone-700 mb-4">
            Account Info
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-stone-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-stone-400">Email</p>
                <p className="text-stone-700 font-medium">{user?.email}</p>
              </div>
              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Verified
              </span>
            </div>

            {user?.studentId && (
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-stone-400">Student ID</p>
                  <p className="text-stone-700 font-mono font-medium">
                    {user.studentId}
                  </p>
                </div>
              </div>
            )}

            {university && (
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap className="w-4 h-4 text-stone-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-stone-400">University</p>
                  <p className="text-stone-700 font-medium">
                    {university.name}
                  </p>
                  <p className="text-xs text-stone-400">{university.city}</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-stone-400 mt-4">
            Email, student ID and university cannot be changed after
            registration.
          </p>
        </div>

        {/* Editable fields */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-stone-700">
              Personal Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Full name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Phone number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. 01712345678"
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Gender{" "}
                <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2">
              Save changes
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ProfilePage;