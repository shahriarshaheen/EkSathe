import { Router } from "express";
import authRoutes from "./authRoutes.js";
import parkingRoutes from "./parkingRoutes.js";
import incidentRoutes from "./incidentRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import sosRoutes from "./sosRoutes.js";
import userRoutes from "./userRoutes.js";
import adminRoutes from "./adminRoutes.js";
import carpoolRoutes from "./carpoolRouter.js";
import ratingRoutes from "./ratingRoutes.js";
import messageRoutes from "./messageRoutes.js";
import tripShareRoutes from './tripShareRoutes.js';
import announcementRoutes from './announcementRoutes.js'; 
const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "EkSathe server is running" });
});

router.use("/auth", authRoutes);
router.use("/parking", parkingRoutes);
router.use("/incidents", incidentRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payment", paymentRoutes);
router.use("/sos", sosRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/carpool", carpoolRoutes);
router.use("/ratings", ratingRoutes);
router.use("/messages", messageRoutes);
router.use("/tripshare", tripShareRoutes);
router.use("/announcements", announcementRoutes);
export default router;
