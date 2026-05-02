import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UNIVERSITIES } from "../constants/universities.js";

const BCRYPT_SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    // ─── Core Identity ───────────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Never returned in queries by default
    },

    // ─── Role & Status ───────────────────────────────────────────────
    role: {
      type: String,
      enum: {
        values: ["student", "homeowner", "admin"],
        message: "Role must be student, homeowner, or admin",
      },
      required: [true, "Role is required"],
    },

    status: {
      type: String,
      enum: {
        values: ["pending_verification", "active", "suspended"],
        message: "Invalid account status",
      },
      default: "pending_verification",
    },

    // ─── Student-Only Field ──────────────────────────────────────────
    studentId: {
      type: String,
      trim: true,
      required: [
        function () {
          return this.role === "student";
        },
        "Student ID is required for student accounts",
      ],
    },
    university: {
      type: String,
      enum: {
        values: [...UNIVERSITIES.map((u) => u.id), null, undefined],
        message: "Invalid university selection",
      },
      default: null,
    },
    // ─── Optional Profile Fields ─────────────────────────────────────
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "Gender must be male, female, or other",
      },
      default: null,
    },

    photoUrl: {
      type: String,
      default: null,
    },
    photoPublicId: {
      type: String,
      select: false,
    },

    // ─── Trust & Verification ────────────────────────────────────────
    trustScore: {
      type: Number,
      default: 0,
    },
    studentVerified: {
      type: Boolean,
      default: false,
    },
    studentRejected: {
      type: Boolean,
      default: false,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // ─── Passenger Reward Coins ─────────────────────────────────────
    coinBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    lifetimeCoinsEarned: {
      type: Number,
      default: 0,
      min: 0,
    },

    lifetimeCoinsRedeemed: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ─── OTP Fields (internal) ───────────────────────────────────────
    emailOtp: {
      type: String,
      select: false,
    },

    emailOtpExpiresAt: {
      type: Date,
      select: false,
    },

    // ─── Password Reset Fields (internal) ────────────────────────────
    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpiresAt: {
      type: Date,
      select: false,
    },
    // ─── Firebase Push Token ─────────────────────────────────────
    fcmToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// ─── Pre-Save Hook: Hash Password ───────────────────────────────────
// Async middleware MUST NOT use next()
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
});

// ─── Instance Method: Compare Password ──────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
