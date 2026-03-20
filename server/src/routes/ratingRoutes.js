import express from "express";
import {
  submitRating,
  getReceivedRatings,
  getGivenRatings,
  getPublicRatings,
  checkRated,
} from "../controllers/ratingController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.post("/", authenticate, submitRating);
router.get("/received", authenticate, getReceivedRatings);
router.get("/given", authenticate, getGivenRatings);
router.get("/check", authenticate, checkRated);
router.get("/user/:id", getPublicRatings); // public

export default router;
