import { Router } from "express";
import authRoutes from "./authRoutes.js";
import parkingRoutes from "./parkingRoutes.js";
import sosRoutes from "./sosRoutes.js";
import userRoutes from "./userRoutes.js";
import adminRoutes from "./adminRoutes.js";
const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "EkSathe server is running",
  });
});

router.use("/auth", authRoutes);
router.use("/parking", parkingRoutes);
router.use("/sos", sosRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
export default router;
