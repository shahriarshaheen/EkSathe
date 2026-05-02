import express from "express";
import {
  createSpot,
  getSpots,
  getSpotById,
  getMySpots,
  updateSpot,
  deleteSpot,
} from "../controllers/parkingController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import upload from "../middleware/upload.js";
import {
  validateCreateSpot,
  handleValidationErrors,
} from "../validators/parkingValidator.js";

const router = express.Router();

// ── Public routes ──────────────────────────────────────────
router.get("/", getSpots);
router.get("/:id", getSpotById);

// ── Protected routes — homeowner only ─────────────────────
router.post(
  "/",
  authenticate,
  authorize("homeowner"),
  upload.array("photos", 3),
  validateCreateSpot,
  handleValidationErrors,
  createSpot,
);

router.get("/my/listings", authenticate, authorize("homeowner"), getMySpots);

router.put(
  "/:id",
  authenticate,
  authorize("homeowner"),
  upload.array("photos", 3),
  handleValidationErrors,
  updateSpot,
);

router.delete("/:id", authenticate, authorize("homeowner"), deleteSpot);

export default router;
