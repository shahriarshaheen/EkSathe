import { Router } from "express";
import {
  registerUser,
  verifyEmail,
  loginUser,
  getMe,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import {
  validateRegister,
  validateVerifyEmail,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from "../validators/authValidator.js";

import authenticate from "../middleware/authenticate.js";

const router = Router();

router.post("/register", validateRegister, registerUser);
router.post("/verify-email", validateVerifyEmail, verifyEmail);
router.post("/login", validateLogin, loginUser);

router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logoutUser);

router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);

export default router;
