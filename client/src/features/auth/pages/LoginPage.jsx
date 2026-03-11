import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { loginSchema } from "../schemas/authSchemas";
import { useAuth } from "../../../context/AuthContext";
import AuthLayout from "../../../components/ui/AuthLayout";
import FormField from "../../../components/ui/FormField";
import Button from "../../../components/ui/Button";
import { cn } from "../../../lib/utils";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect back to the page user tried to access before being sent to login
  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: location.state?.email || "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to your EkSathe account.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormField
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Password with show/hide */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-stone-700"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-teal-700 font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              autoComplete="current-password"
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

        <Button type="submit" loading={loading} className="mt-2">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-teal-700 font-medium hover:underline"
        >
          Create one
        </Link>
      </p>

      <p className="mt-2 text-center text-sm text-stone-500">
        Need to verify your email?{" "}
        <Link
          to="/verify-email"
          className="text-teal-700 font-medium hover:underline"
        >
          Verify here
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
