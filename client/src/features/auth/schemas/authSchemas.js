import { z } from "zod";

// ─── Register ─────────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(60, "Name must be under 60 characters"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^\d{10,15}$/, "Phone must be 10–15 digits, no spaces or symbols"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        "Password must contain at least one letter and one number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.enum(["student", "homeowner", "admin"], {
      errorMap: () => ({ message: "Please select a role" }),
    }),
    studentId: z.string().trim().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.role === "student") {
        return !!data.studentId && data.studentId.trim().length > 0;
      }
      return true;
    },
    {
      message: "Student ID is required for student accounts",
      path: ["studentId"],
    },
  );

// ─── Verify Email ─────────────────────────────────────────────────────────────
export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email"),
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        "Must contain at least one letter and one number",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
