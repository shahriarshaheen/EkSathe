import express from "express";
import {
  getProfile,
  updateProfile,
  deletePhoto,
} from "../controllers/userController.js";
import authenticate from "../middleware/authenticate.js";
import upload from "../middleware/upload.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, upload.single("photo"), updateProfile);
router.delete("/profile/photo", authenticate, deletePhoto);

// POST /api/user/fcm-token
router.post("/fcm-token", authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token required" });
    }
    await User.findByIdAndUpdate(req.user.id, { fcmToken: token });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;