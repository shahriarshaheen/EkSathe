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
import {
  startTrip,
  endTrip,
  pingLocation,
  getDeviationAlerts,
  acknowledgeAlert,
} from "../controllers/deviationController.js";
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

// ─── F-14: Route Deviation Alert ─────────────────────────────────────────────
router.post("/routes/:id/start", authenticate, startTrip);
router.patch("/routes/:id/end-trip", authenticate, endTrip);
router.post("/routes/:id/location", authenticate, pingLocation);
router.get("/routes/:id/deviation-alerts", authenticate, getDeviationAlerts);
router.post(
  "/routes/:id/deviation-alerts/:alertId/ack",
  authenticate,
  acknowledgeAlert
);

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