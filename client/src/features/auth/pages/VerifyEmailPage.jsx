import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";

import { authService } from "../../../services/authService";
import AuthLayout from "../../../components/ui/AuthLayout";
import OtpInput from "../../../components/ui/OtpInput";
import Button from "../../../components/ui/Button";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Email may come from register redirect state or a pre-fill query param
  const emailFromState = location.state?.email || "";
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Clear OTP error when user starts typing a new code
    if (otpError && otp.length > 0) setOtpError("");
  }, [otp]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email address is missing.");
      return;
    }
    if (otp.length !== 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyEmail({ email: email.trim().toLowerCase(), otp });
      toast.success("Email verified! You can now log in.");
      navigate("/login", { state: { email } });
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP by hitting register again with the same email
  // The backend resend path handles pending_verification users
  const handleResend = async () => {
    if (!email.trim()) {
      toast.error(
        "Email address is missing. Please go back and register again.",
      );
      return;
    }
    setResending(true);
    try {
      await authService.register({ email: email.trim().toLowerCase() });
      toast.success("A new code has been sent to your email.");
      setOtp("");
      setOtpError("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Check your email"
      subtitle={
        email
          ? `We sent a 6-digit code to ${email}`
          : "Enter the 6-digit code we sent to your email address."
      }
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 mb-6">
        <MailCheck className="w-6 h-6 text-teal-600" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Show email input only if not pre-filled from state */}
        {!emailFromState && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-stone-700"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-colors"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-stone-700">
            Verification code
          </label>
          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={loading}
            error={otpError}
          />
        </div>

        <Button type="submit" loading={loading} disabled={otp.length !== 6}>
          Verify email
        </Button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm text-stone-500">
        <p>
          Didn't receive a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-teal-700 font-medium hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        </p>
        <Link
          to="/register"
          className="text-stone-400 hover:text-stone-600 text-xs"
        >
          ← Back to register
        </Link>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
