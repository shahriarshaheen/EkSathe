import Rating from "../models/Rating.js";
import User from "../models/User.js";
import CarpoolRoute from "../models/CarpoolRoute.js";

// ── SUBMIT RATING ─────────────────────────────────────────────
export const submitRating = async (req, res) => {
  try {
    const { ratedUserId, contextType, contextId, ratedRole, score, comment } =
      req.body;

    if (!ratedUserId || !contextType || !contextId || !ratedRole || !score) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }
    if (score < 1 || score > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Score must be between 1 and 5." });
    }
    if (ratedUserId === req.user.id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot rate yourself." });
    }

    // Verify the rater was actually part of this carpool/booking
    if (contextType === "carpool") {
      const ride = await CarpoolRoute.findById(contextId);
      if (!ride) {
        return res
          .status(404)
          .json({ success: false, message: "Ride not found." });
      }

      const isDriver = ride.driver.toString() === req.user.id.toString();
      const isPassenger = ride.passengers.some(
        (p) => p.toString() === req.user.id.toString(),
      );

      if (!isDriver && !isPassenger) {
        return res
          .status(403)
          .json({ success: false, message: "You were not part of this ride." });
      }

      // Verify rated user was also part of this ride
      const ratedIsDriver = ride.driver.toString() === ratedUserId;
      const ratedIsPassenger = ride.passengers.some(
        (p) => p.toString() === ratedUserId,
      );

      if (!ratedIsDriver && !ratedIsPassenger) {
        return res
          .status(403)
          .json({
            success: false,
            message: "The rated user was not part of this ride.",
          });
      }
    }

    // Check for duplicate rating
    const existing = await Rating.findOne({ rater: req.user.id, contextId });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already rated someone for this ride/booking.",
        });
    }

    // Save rating
    const rating = await Rating.create({
      rater: req.user.id,
      rated: ratedUserId,
      contextType,
      contextId,
      ratedRole,
      score,
      comment: comment?.trim() || "",
    });

    // Update trust score
    // 5★ = +3, 4★ = +2, 3★ = +1, 2★ = -1, 1★ = -3
    const trustDelta =
      score === 5
        ? 3
        : score === 4
          ? 2
          : score === 3
            ? 1
            : score === 2
              ? -1
              : -3;
    const ratedUser = await User.findById(ratedUserId);

    if (ratedUser) {
      ratedUser.trustScore = Math.min(
        100,
        Math.max(0, (ratedUser.trustScore || 0) + trustDelta),
      );
      await ratedUser.save();
    }

    const populated = await rating.populate(
      "rater",
      "name photoUrl university",
    );
    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already submitted a rating for this ride/booking.",
        });
    }
    console.error("submitRating error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── GET RATINGS RECEIVED BY LOGGED-IN USER ────────────────────
export const getReceivedRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ rated: req.user.id })
      .populate("rater", "name photoUrl university")
      .sort({ createdAt: -1 });

    const avg = ratings.length
      ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(
          1,
        )
      : null;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((r) => {
      breakdown[r.score] = (breakdown[r.score] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      data: { ratings, average: avg, total: ratings.length, breakdown },
    });
  } catch (err) {
    console.error("getReceivedRatings error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── GET RATINGS GIVEN BY LOGGED-IN USER ──────────────────────
export const getGivenRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ rater: req.user.id })
      .populate("rated", "name photoUrl university")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: ratings });
  } catch (err) {
    console.error("getGivenRatings error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── GET PUBLIC RATINGS FOR ANY USER ──────────────────────────
export const getPublicRatings = async (req, res) => {
  try {
    const { id } = req.params;

    const ratings = await Rating.find({ rated: id })
      .populate("rater", "name photoUrl university")
      .sort({ createdAt: -1 })
      .limit(20);

    const avg = ratings.length
      ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(
          1,
        )
      : null;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((r) => {
      breakdown[r.score] = (breakdown[r.score] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      data: { ratings, average: avg, total: ratings.length, breakdown },
    });
  } catch (err) {
    console.error("getPublicRatings error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── CHECK IF ALREADY RATED THIS CONTEXT ──────────────────────
export const checkRated = async (req, res) => {
  try {
    const { contextId } = req.query;
    if (!contextId) {
      return res
        .status(400)
        .json({ success: false, message: "contextId is required." });
    }

    const existing = await Rating.findOne({ rater: req.user.id, contextId });
    return res
      .status(200)
      .json({ success: true, hasRated: !!existing, data: existing || null });
  } catch (err) {
    console.error("checkRated error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
