import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { registerSchema } from "../schemas/authSchemas";
import { authService } from "../../../services/authService";
import AuthLayout from "../../../components/ui/AuthLayout";
import FormField from "../../../components/ui/FormField";
import Button from "../../../components/ui/Button";
import { cn } from "../../../lib/utils";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "student" },
  });

  const role = watch("role");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Strip confirmPassword — backend does not expect it
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
          <div className="grid grid-cols-2 gap-2">
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

        <FormField
          id="name"
          label="Full name"
          placeholder="Aditya Sharma"
          error={errors.name?.message}
          {...register("name")}
        />

        <FormField
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <FormField
          id="phone"
          label="Phone number"
          type="tel"
          placeholder="9876543210"
          error={errors.phone?.message}
          hint="10–15 digits, no spaces"
          {...register("phone")}
        />

        {/* Conditional student ID */}
        {role === "student" && (
          <FormField
            id="studentId"
            label="Student ID"
            placeholder="e.g. 2021BCS045"
            error={errors.studentId?.message}
            {...register("studentId")}
          />
        )}

        {/* Password with show/hide toggle */}
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
              aria-label={showPassword ? "Hide password" : "Show password"}
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
