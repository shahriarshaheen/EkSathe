import { Router } from "express";
import {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIpn,
} from "../controllers/paymentController.js";
import authenticate from "../middleware/authenticate.js";

const router = Router();

router.post("/initiate/:bookingId", authenticate, initiatePayment);
router.post("/success", paymentSuccess);
router.post("/fail", paymentFail);
router.post("/cancel", paymentCancel);
router.post("/ipn", paymentIpn);

export default router;