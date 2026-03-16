import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, ChevronDown, Search } from "lucide-react";

import { registerSchema } from "../schemas/authSchemas";
import { authService } from "../../../services/authService";
import AuthLayout from "../../../components/ui/AuthLayout";
import FormField from "../../../components/ui/FormField";
import Button from "../../../components/ui/Button";
import { cn } from "../../../lib/utils";
import {
  UNIVERSITIES,
  getUniversityById,
} from "../../../constants/universities";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uniSearch, setUniSearch] = useState("");
  const [uniDropdownOpen, setUniDropdownOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "student" },
  });

  const role = watch("role");
  const selectedUniversity = watch("university");

  const selectedUni = selectedUniversity
    ? getUniversityById(selectedUniversity)
    : null;

  const filteredUniversities = UNIVERSITIES.filter(
    (u) =>
      u.name.toLowerCase().includes(uniSearch.toLowerCase()) ||
      u.city.toLowerCase().includes(uniSearch.toLowerCase()),
  );

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = data;
      await authService.register(payload);
      toast.success(
        "Account created! Check your email for the verification code.",
      );
      navigate("/verify-email", { state: { email: data.email } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join EkSathe to find parking and carpooling near your campus."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Role selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-stone-700">I am a</label>
          <div className="grid grid-cols-3 gap-2">
            {["student", "homeowner", "admin"].map((r) => (
              <label
                key={r}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-all duration-150 select-none",
                  role === r
                    ? "bg-stone-900 text-white border-stone-900"
                    : "bg-white text-stone-600 border-stone-200 hover:border-stone-300",
                )}
              >
                <input
                  type="radio"
                  value={r}
                  className="sr-only"
                  {...register("role")}
                />
                {r === "student"
                  ? "Student"
                  : r === "homeowner"
                    ? "Homeowner"
                    : "Admin"}
              </label>
            ))}
          </div>
          {errors.role && (
            <p className="text-xs text-red-500">{errors.role.message}</p>
          )}
        </div>

        {/* University selector — students only */}
        {role === "student" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">
              University
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setUniDropdownOpen((v) => !v)}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 text-sm rounded-lg border bg-white transition-colors",
                  errors.university
                    ? "border-red-400"
                    : "border-stone-200 hover:border-stone-300",
                  uniDropdownOpen && "border-teal-600 ring-2 ring-teal-600/20",
                )}
              >
                <span
                  className={selectedUni ? "text-stone-900" : "text-stone-400"}
                >
                  {selectedUni ? selectedUni.name : "Select your university"}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-stone-400 transition-transform",
                    uniDropdownOpen && "rotate-180",
                  )}
                />
              </button>

              {uniDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {/* Search */}
                  <div className="p-2 border-b border-stone-100">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search university..."
                        value={uniSearch}
                        onChange={(e) => setUniSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredUniversities.length === 0 ? (
                      <p className="text-xs text-stone-400 text-center py-4">
                        No university found
                      </p>
                    ) : (
                      filteredUniversities.map((uni) => (
                        <button
                          key={uni.id}
                          type="button"
                          onClick={() => {
                            setValue("university", uni.id);
                            setUniDropdownOpen(false);
                            setUniSearch("");
                          }}
                          className={cn(
                            "w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-stone-50 transition-colors",
                            selectedUniversity === uni.id && "bg-teal-50",
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm font-medium truncate",
                                selectedUniversity === uni.id
                                  ? "text-teal-700"
                                  : "text-stone-800",
                              )}
                            >
                              {uni.name}
                            </p>
                            <p className="text-xs text-stone-400">
                              {uni.city} · @{uni.domain}
                            </p>
                          </div>
                          {selectedUniversity === uni.id && (
                            <span className="text-teal-600 text-xs font-bold mt-0.5">
                              ✓
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Email hint */}
            {selectedUni && (
              <p className="text-xs text-teal-600 flex items-center gap-1">
                <span>📧</span>
                Use your university email ending in{" "}
                <strong>@{selectedUni.domain}</strong>
              </p>
            )}

            {errors.university && (
              <p className="text-xs text-red-500">
                {errors.university.message}
              </p>
            )}
          </div>
        )}

        <FormField
          id="name"
          label="Full name"
          placeholder="Please enter your full name"
          error={errors.name?.message}
          {...register("name")}
        />

        <FormField
          id="email"
          label="Email address"
          type="email"
          placeholder={
            role === "student" && selectedUni
              ? `yourname@${selectedUni.domain}`
              : "you@example.com"
          }
          error={errors.email?.message}
          {...register("email")}
        />

        <FormField
          id="phone"
          label="Phone number"
          type="tel"
          placeholder="01XXXXXXXXX"
          error={errors.phone?.message}
          hint="10–15 digits, no spaces"
          {...register("phone")}
        />

        {/* Student ID */}
        {role === "student" && (
          <FormField
            id="studentId"
            label="Student ID"
            placeholder="e.g. 20202020"
            error={errors.studentId?.message}
            hint="Your official university student ID for verification"
            {...register("studentId")}
          />
        )}

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-stone-700"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 chars, letter + number"
              className={cn(
                "w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border bg-white text-stone-900",
                "placeholder:text-stone-400 transition-colors duration-150",
                "focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600",
                errors.password
                  ? "border-red-400 focus:ring-red-400/20 focus:border-red-400"
                  : "border-stone-200 hover:border-stone-300",
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
              {errors.password.message}
            </p>
          )}
        </div>

        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" loading={loading} className="mt-2">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link to="/login" className="text-teal-700 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
