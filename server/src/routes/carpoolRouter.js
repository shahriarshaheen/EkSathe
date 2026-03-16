import express from "express";
import {
  getPresetRoutes,
  getRoutes,
  createRoute,
  joinRoute,
  leaveRoute,
  getMyRides,
  cancelRoute,
  adminGetAllRoutes,
  adminCancelRoute,
} from "../controllers/carpoolController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// Public
router.get("/presets", getPresetRoutes);

// Authenticated
router.get("/routes", authenticate, getRoutes);
router.post("/routes", authenticate, createRoute);
router.post("/routes/:id/join", authenticate, joinRoute);
router.delete("/routes/:id/leave", authenticate, leaveRoute);
router.patch("/routes/:id/cancel", authenticate, cancelRoute);
router.get("/my", authenticate, getMyRides);

// Admin only
router.get(
  "/admin/routes",
  authenticate,
  authorize("admin"),
  adminGetAllRoutes,
);
router.patch(
  "/admin/routes/:id/cancel",
  authenticate,
  authorize("admin"),
  adminCancelRoute,
);

export default router;
