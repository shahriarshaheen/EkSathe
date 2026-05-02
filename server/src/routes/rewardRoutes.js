import express from "express";
import {
  getMyRewards,
  getRewardQuote,
} from "../controllers/rewardController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/me", authenticate, getMyRewards);
router.get("/quote", authenticate, getRewardQuote);

export default router;