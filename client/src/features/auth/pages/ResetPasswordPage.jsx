import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ShieldCheck, AlertTriangle } from "lucide-react";

import { resetPasswordSchema } from "../schemas/authSchemas";
import { authService } from "../../../services/authService";
import AuthLayout from "../../../components/ui/AuthLayout";
import FormField from "../../../components/ui/FormField";
import Button from "../../../components/ui/Button";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  if (!token) {
    return (
      <AuthLayout title="Invalid reset link">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 border border-red-100 mb-6">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <p className="text-stone-500 text-sm leading-relaxed mb-6">
          This password reset link is missing a token. Please request a new
          reset link.
        </p>
        <Link
          to="/forgot-password"
          className="text-sm text-teal-700 font-medium hover:underline"
        >
          Request a new link →
        </Link>
      </AuthLayout>
    );
  }

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.resetPassword({ token, newPassword: data.newPassword });
      setSuccess(true);
      toast.success("Password reset successfully.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Password updated">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 mb-6">
          <ShieldCheck className="w-6 h-6 text-teal-600" />
        </div>
        <p className="text-stone-500 text-sm leading-relaxed mb-6">
          Your password has been changed successfully. You can now log in with
          your new password.
        </p>
        <Button onClick={() => navigate("/login")}>Go to login</Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password for your EkSathe account."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <FormField
          id="newPassword"
          label="New password"
          type="password"
          placeholder="Min. 8 chars, letter + number"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          hint="At least 8 characters with one letter and one number"
          {...register("newPassword")}
        />

        <FormField
          id="confirmPassword"
          label="Confirm new password"
          type="password"
          placeholder="Repeat your new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" loading={loading} className="mt-2">
          Reset password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Remembered your password?{" "}
        <Link to="/login" className="text-teal-700 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
