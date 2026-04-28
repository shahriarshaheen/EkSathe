import { Router } from "express";
import {
  getAvailableCoupons,
  validateCoupon,
} from "../controllers/couponController.js";
import authenticate from "../middleware/authenticate.js";

const router = Router();

router.get("/available", authenticate, getAvailableCoupons);

// Student route — validate a coupon before paying
// POST /api/coupons/validate
router.post("/validate", authenticate, validateCoupon);

export default router;
