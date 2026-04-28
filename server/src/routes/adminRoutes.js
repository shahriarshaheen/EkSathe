import express from "express";
import {
  getPendingStudents,
  getAllStudents,
  getAllUsers,
  approveStudent,
  rejectStudent,
  suspendUser,
  unsuspendUser,
  getStats,
} from "../controllers/adminController.js";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  toggleCoupon,
  deleteCoupon,
} from "../controllers/couponController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(authorize("admin"));

// Stats
router.get("/stats", getStats);

// Student verification
router.get("/students", getAllStudents);
router.get("/students/pending", getPendingStudents);
router.put("/students/:id/approve", approveStudent);
router.put("/students/:id/reject", rejectStudent);

// User management
router.get("/users", getAllUsers);
router.patch("/users/:id/suspend", suspendUser);
router.patch("/users/:id/unsuspend", unsuspendUser);

// Coupon management
router.post("/coupons", createCoupon);
router.get("/coupons", getAllCoupons);
router.get("/coupons/:id", getCouponById);
router.put("/coupons/:id", updateCoupon);
router.patch("/coupons/:id/toggle", toggleCoupon);
router.delete("/coupons/:id", deleteCoupon);

export default router;
