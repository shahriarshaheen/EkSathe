import User from "../models/User.js";
import generateOtp from "../utils/generateOtp.js";
import generateToken from "../utils/generateToken.js";
import generateResetToken from "../utils/generateResetToken.js";
import {
  sendOtpEmail,
  sendPasswordResetEmail,
} from "../services/emailService.js";

// ─── Constants ────────────────────────────────────────────────────────────────
const OTP_EXPIRY_MS = 60 * 60 * 1000;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

// ─── Email Send Helpers ───────────────────────────────────────────────────────
const sendOtpOrLog = async (email, otp) => {
  const canSendEmail = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  if (!canSendEmail) {
    console.log("─────────────────────────────────────────");
    console.log("  [DEV MODE] Email credentials not set.");
    console.log(`  OTP for ${email}: ${otp}`);
    console.log("─────────────────────────────────────────");
    return;
  }
  await sendOtpEmail(email, otp);
};

const sendResetEmailOrLog = async (email, resetUrl) => {
  const canSendEmail = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  if (!canSendEmail) {
    console.log("─────────────────────────────────────────");
    console.log("  [DEV MODE] Email credentials not set.");
    console.log(`  Password reset URL for ${email}:`);
    console.log(`  ${resetUrl}`);
    console.log("─────────────────────────────────────────");
    return;
  }
  await sendPasswordResetEmail(email, resetUrl);
};

// ─── Register User ────────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  const { name, email, phone, password, role, studentId, gender, university } =
    req.body;

  try {
    const existingUser = await User.findOne({ email }).select("+password");

    if (existingUser) {
      if (existingUser.status === "active") {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists. Please log in.",
        });
      }

      if (existingUser.status === "suspended") {
        return res.status(403).json({
          success: false,
          message: "This account has been suspended. Please contact support.",
        });
      }

      if (existingUser.status === "pending_verification") {
        const otp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
        existingUser.emailOtp = otp;
        existingUser.emailOtpExpiresAt = otpExpiresAt;
        await existingUser.save();

        try {
          await sendOtpOrLog(existingUser.email, otp);
        } catch (emailError) {
          console.error("OTP resend email failed:", emailError.message);
          return res.status(500).json({
            success: false,
            message:
              "Account exists but we could not resend the verification email. Please try again.",
          });
        }

        return res.status(200).json({
          success: true,
          message:
            "A verification code has been resent to your email. Please check your inbox.",
        });
      }
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    const user = new User({
      name,
      email,
      phone,
      password,
      role,
      studentId: role === "student" ? studentId : undefined,
      university: role === "student" ? university : undefined,
      gender: gender ?? undefined,
      status: "pending_verification",
      isEmailVerified: false,
      emailOtp: otp,
      emailOtpExpiresAt: otpExpiresAt,
    });

    await user.save();

    try {
      await sendOtpOrLog(user.email, otp);
    } catch (emailError) {
      console.error("Registration OTP email failed:", emailError.message);
      return res.status(500).json({
        success: false,
        message:
          "Account created but we could not send the verification email. Please try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please check your email for the verification code.",
      data: {
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }
    console.error("registerUser error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ─── Verify Email ─────────────────────────────────────────────────────────────
export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email }).select(
      "+emailOtp +emailOtpExpiresAt",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "This account has been suspended. Please contact support.",
      });
    }

    if (user.isEmailVerified && user.status === "active") {
      return res.status(400).json({
        success: false,
        message: "This account is already verified. Please log in.",
      });
    }

    if (!user.emailOtp || !user.emailOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message:
          "No verification code found. Please register again to receive a new code.",
      });
    }

    if (new Date() > user.emailOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message:
          "Your verification code has expired. Please register again to receive a new code.",
      });
    }

    if (otp !== user.emailOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check and try again.",
      });
    }

    user.isEmailVerified = true;
    user.status = "active";
    user.emailOtp = undefined;
    user.emailOtpExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("verifyEmail error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ─── Login User ───────────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    if (!user.isEmailVerified || user.status === "pending_verification") {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in. Check your inbox for the verification code.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "This account has been suspended. Please contact support.",
      });
    }

    const token = generateToken({
      id: user._id,
      role: user.role,
      status: user.status,
    });

    const userPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      trustScore: user.trustScore,
      photoUrl: user.photoUrl ?? null,
      university: user.university ?? null,
      studentId: user.studentId ?? null,
    };

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      data: userPayload,
    });
  } catch (error) {
    console.error("loginUser error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ─── Get Authenticated User ───────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        trustScore: user.trustScore,
        photoUrl: user.photoUrl ?? null,
        isEmailVerified: user.isEmailVerified,
        university: user.university ?? null,
        studentId: user.studentId ?? null,
        phone: user.phone ?? null,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    console.error("getMe error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ─── Logout User ──────────────────────────────────────────────────────────────
export const logoutUser = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully. Please remove your token.",
  });
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const genericResponse = {
    success: true,
    message:
      "If an account with that email exists, a password reset link has been sent.",
  };

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json(genericResponse);

    const resetToken = generateResetToken();
    const resetExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

    user.passwordResetToken = resetToken;
    user.passwordResetExpiresAt = resetExpiresAt;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    try {
      await sendResetEmailOrLog(user.email, resetUrl);
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpiresAt = undefined;
      await user.save();
      console.error("Password reset email failed:", emailError.message);
      return res.status(500).json({
        success: false,
        message: "Could not send the password reset email. Please try again.",
      });
    }

    return res.status(200).json(genericResponse);
  } catch (error) {
    console.error("forgotPassword error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({ passwordResetToken: token }).select(
      "+passwordResetToken +passwordResetExpiresAt",
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token. Please request a new one.",
      });
    }

    if (new Date() > user.passwordResetExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "This reset token has expired. Please request a new one.",
      });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("resetPassword error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};