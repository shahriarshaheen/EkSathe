import { Router } from "express";
import authRoutes from "./authRoutes.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "EkSathe server is running",
  });
});

router.use("/auth", authRoutes);

export default router;
