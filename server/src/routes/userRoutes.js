import express from "express";
import {
  getProfile,
  updateProfile,
  deletePhoto,
} from "../controllers/userController.js";
import authenticate from "../middleware/authenticate.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// All user routes require authentication
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, upload.single("photo"), updateProfile);
router.delete("/profile/photo", authenticate, deletePhoto);

export default router;
