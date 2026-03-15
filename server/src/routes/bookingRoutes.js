import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getSpotBookings,
  cancelBooking,
  getHomeownerBookings,
} from "../controllers/bookingController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import {
  validateCreateBooking,
  validateCancelBooking,
} from "../validators/bookingValidator.js";

const router = Router();

// Student routes
router.post("/", authenticate, authorize("student"), validateCreateBooking, createBooking);
router.get("/my", authenticate, authorize("student"), getMyBookings);

// Homeowner routes
router.get("/homeowner", authenticate, authorize("homeowner"), getHomeownerBookings);

// Shared — homeowner or admin views bookings for a specific spot
router.get("/spot/:spotId", authenticate, getSpotBookings);

// Cancel — student, homeowner, or admin
router.patch("/:id/cancel", authenticate, validateCancelBooking, cancelBooking);

export default router;