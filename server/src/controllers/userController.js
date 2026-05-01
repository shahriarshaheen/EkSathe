import { v2 as cloudinary } from "cloudinary";
import User from "../models/User.js";

// ── GET PROFILE ───────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        trustScore: user.trustScore,
        photoUrl: user.photoUrl ?? null,
        isEmailVerified: user.isEmailVerified,
        university: user.university ?? null,
        studentId: user.studentId ?? null,
        gender: user.gender ?? null,
      },
    });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── UPDATE PROFILE ────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const { name, phone, gender } = req.body;

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (gender) user.gender = gender;

    // Handle photo upload
    if (req.file) {
      // Delete old photo from Cloudinary if exists
      if (user.photoUrl && user.photoPublicId) {
        await cloudinary.uploader.destroy(user.photoPublicId);
      }
      user.photoUrl = req.file.path;
      user.photoPublicId = req.file.filename;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        trustScore: user.trustScore,
        photoUrl: user.photoUrl ?? null,
        isEmailVerified: user.isEmailVerified,
        university: user.university ?? null,
        studentId: user.studentId ?? null,
        gender: user.gender ?? null,
      },
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── DELETE PROFILE PHOTO ──────────────────────────────────────
export const deletePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (!user.photoUrl) {
      return res
        .status(400)
        .json({ success: false, message: "No photo to delete." });
    }

    // Delete from Cloudinary
    if (user.photoPublicId) {
      await cloudinary.uploader.destroy(user.photoPublicId);
    }

    user.photoUrl = undefined;
    user.photoPublicId = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo removed.",
    });
  } catch (err) {
    console.error("deletePhoto error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};