import { Router } from "express";
import authenticate from "../middleware/authenticate.js";
import Notification from "../models/Notification.js";

const router = Router();

// GET /api/notifications/my
router.get("/my", authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      read: false,
    });

    return res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", authenticate, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true }
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", authenticate, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;