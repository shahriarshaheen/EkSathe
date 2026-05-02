import { body, validationResult } from "express-validator";
import {
  STUDENT_EMAIL_DOMAINS,
  getUniversityById,
} from "../constants/universities.js";
// ─── Validation Result Handler ────────────────────────────────────────────────
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      errors: formatted,
    });
  }

  next();
};

// ─── Reusable Rules ───────────────────────────────────────────────────────────
const emailRule = body("email")
  .trim()
  .notEmpty()
  .withMessage("Email is required")
  .isEmail()
  .withMessage("Must be a valid email address")
  .normalizeEmail();

const passwordRule = (fieldName = "password", label = "Password") =>
  body(fieldName)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`)
    .isLength({ min: 8 })
    .withMessage(`${label} must be at least 8 characters`)
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .withMessage(`${label} must contain at least one letter and one number`);

// ─── Register ─────────────────────────────────────────────────────────────────
export const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be between 2 and 60 characters"),

  emailRule,

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\d{10,15}$/)
    .withMessage("Phone must be 10 to 15 digits with no spaces or symbols"),

  passwordRule("password", "Password"),

  body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["student", "homeowner", "admin"])
    .withMessage("Role must be one of: student, homeowner, admin"),

  body("studentId")
    .optional()
    .trim()
    .custom((value, { req }) => {
      if (req.body.role === "student" && (!value || value === "")) {
        throw new Error("Student ID is required for student accounts");
      }
      return true;
    }),
  // University required for students
  body("university").custom((value, { req }) => {
    if (req.body.role === "student") {
      if (!value) throw new Error("Please select your university");
      const uni = getUniversityById(value);
      if (!uni) throw new Error("Invalid university selected");
    }
    return true;
  }),

  // Email domain must match selected university for students
  body("email").custom((value, { req }) => {
    if (req.body.role === "student") {
      const uni = getUniversityById(req.body.university);
      if (uni) {
        const emailDomain = value.split("@")[1];
        if (emailDomain !== uni.domain) {
          throw new Error(
            `Students from ${uni.name} must use a @${uni.domain} email address`,
          );
        }
      }
    }
    return true;
  }),
  handleValidationErrors,
];

// ─── Verify Email OTP ─────────────────────────────────────────────────────────
export const validateVerifyEmail = [
  emailRule,

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .matches(/^\d{6}$/)
    .withMessage("OTP must be exactly 6 digits"),

  handleValidationErrors,
];

// ─── Login ────────────────────────────────────────────────────────────────────
export const validateLogin = [
  emailRule,

  body("password").trim().notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const validateForgotPassword = [emailRule, handleValidationErrors];

// ─── Reset Password ───────────────────────────────────────────────────────────
export const validateResetPassword = [
  body("token").trim().notEmpty().withMessage("Reset token is required"),

  passwordRule("newPassword", "New password"),

  handleValidationErrors,
];
