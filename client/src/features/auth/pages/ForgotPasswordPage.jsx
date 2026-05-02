import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

import { forgotPasswordSchema } from "../schemas/authSchemas";
import { authService } from "../../../services/authService";
import AuthLayout from "../../../components/ui/AuthLayout";
import FormField from "../../../components/ui/FormField";
import Button from "../../../components/ui/Button";

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data);
      setSubmitted(true);
    } catch (err) {
      // Server always returns 200 for this endpoint even if email not found.
      // Any real error here is a network/server failure.
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="Check your inbox">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 mb-6">
          <KeyRound className="w-6 h-6 text-teal-600" />
        </div>
        <p className="text-stone-500 text-sm leading-relaxed mb-6">
          If an account with{" "}
          <span className="font-medium text-stone-700">
            {getValues("email")}
          </span>{" "}
          exists, we've sent a password reset link. Check your inbox and spam
          folder.
        </p>
        <p className="text-stone-400 text-sm">
          Link not arriving?{" "}
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="text-teal-700 font-medium hover:underline"
          >
            Try again
          </button>
        </p>
        <div className="mt-6">
          <Link
            to="/login"
            className="text-sm text-stone-400 hover:text-stone-600"
          >
            ← Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link if your account exists."
    >
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

        <Button type="submit" loading={loading} className="mt-2">
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Remember your password?{" "}
        <Link to="/login" className="text-teal-700 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
