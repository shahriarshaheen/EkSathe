import {
  getUserRewardSummary,
  getEligibleRedemptionTiers,
  releaseExpiredCoinReservations,
} from "../services/rewardService.js";

// ── GET /api/rewards/me ─────────────────────────────────────
export const getMyRewards = async (req, res) => {
  try {
    await releaseExpiredCoinReservations();

    const summary = await getUserRewardSummary(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Reward summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    console.error("getMyRewards error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reward summary",
    });
  }
};

// ── GET /api/rewards/quote?serviceType=carpool&amount=120 ────
export const getRewardQuote = async (req, res) => {
  try {
    await releaseExpiredCoinReservations();

    const { serviceType = "carpool", amount } = req.query;

    if (serviceType !== "carpool") {
      return res.status(400).json({
        success: false,
        message: "Coins can only be redeemed for carpool payments.",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required.",
      });
    }

    const quote = await getEligibleRedemptionTiers({
      userId: req.user.id,
      amount: numericAmount,
    });

    return res.status(200).json({
      success: true,
      message: "Reward quote fetched successfully",
      data: quote,
    });
  } catch (error) {
    console.error("getRewardQuote error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reward quote",
    });
  }
};