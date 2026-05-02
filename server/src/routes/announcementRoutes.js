import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  getHomeownerAnnouncements,
  deleteAnnouncement,
  dismissAnnouncement,
} from "../controllers/announcementController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/homeowner/all", authenticate, getHomeownerAnnouncements);
router.post("/:spotId", authenticate, createAnnouncement);
router.delete("/:id", authenticate, deleteAnnouncement);
router.get("/:spotId", authenticate, getAnnouncements);
router.post("/:id/dismiss", authenticate, dismissAnnouncement);

export default router;