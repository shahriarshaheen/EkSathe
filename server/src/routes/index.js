import { Router } from "express";
import authRoutes from "./authRoutes.js";
import parkingRoutes from "./parkingRoutes.js";
import incidentRoutes from "./incidentRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import sosRoutes from "./sosRoutes.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "EkSathe server is running",
  });
});

router.use("/auth", authRoutes);
router.use("/parking", parkingRoutes);
router.use("/incidents", incidentRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payment", paymentRoutes);
router.use("/sos", sosRoutes);

export default router;