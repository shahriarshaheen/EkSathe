import { Router } from "express";
import {
  initiatePayment,
  initiateCarpoolPayment,
  paymentSuccess,
  carpoolPaymentSuccess,
  paymentFail,
  carpoolPaymentFail,
  paymentCancel,
  carpoolPaymentCancel,
  paymentIpn,
} from "../controllers/paymentController.js";
import authenticate from "../middleware/authenticate.js";

const router = Router();

// Parking payment
router.post("/initiate/:bookingId", authenticate, initiatePayment);
router.post("/success", paymentSuccess);
router.post("/fail", paymentFail);
router.post("/cancel", paymentCancel);

// Carpool payment
router.post("/carpool/initiate/:routeId", authenticate, initiateCarpoolPayment);
router.post("/carpool/success", carpoolPaymentSuccess);
router.post("/carpool/fail", carpoolPaymentFail);
router.post("/carpool/cancel", carpoolPaymentCancel);

// IPN handles both
router.post("/ipn", paymentIpn);

export default router;
