import { Router } from "express";
import authRoutes from "./authRoutes.js";
import parkingRoutes from "./parkingRoutes.js";
const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "EkSathe server is running",
  });
});

router.use("/auth", authRoutes);
router.use("/parking", parkingRoutes);
export default router;
