import express from "express";
import {
  getPresetRoutes,
  getRoutes,
  createRoute,
  joinRoute,
  leaveRoute,
  getMyRides,
  cancelRoute,
} from "../controllers/carpoolController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/presets", getPresetRoutes);
router.get("/routes", getRoutes);
router.post("/routes", authenticate, createRoute);
router.post("/routes/:id/join", authenticate, joinRoute);
router.delete("/routes/:id/leave", authenticate, leaveRoute);
router.patch("/routes/:id/cancel", authenticate, cancelRoute);
router.get("/my", authenticate, getMyRides);

export default router;