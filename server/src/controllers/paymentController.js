import SSLCommerzPayment from "sslcommerz-lts";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import CarpoolRoute from "../models/CarpoolRoute.js";
import User from "../models/User.js";
import { sendPush } from "../services/pushService.js";
import { validateCouponLogic, markCouponUsed } from "./couponController.js";

const getSSL = () => ({
  STORE_ID: process.env.SSLCOMMERZ_STORE_ID,
  STORE_PASSWORD: process.env.SSLCOMMERZ_STORE_PASSWORD,
  IS_LIVE: process.env.SSLCOMMERZ_IS_LIVE === "true",
  SERVER_URL:
    process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
});

const isGatewayValid = (status) => status === "VALID" || status === "VALIDATED";

const validateGatewayPayment = async (valId) => {
  const { STORE_ID, STORE_PASSWORD, IS_LIVE } = getSSL();
  const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
  const validation = await sslcz.validate({ val_id: valId });
  return isGatewayValid(validation?.status);
};

const markCouponUsedOnce = async (payment) => {
  if (!payment?.couponCode || payment.couponUsageMarked) return;

  const locked = await Payment.findOneAndUpdate(
    { _id: payment._id, couponUsageMarked: { $ne: true } },
    { couponUsageMarked: true },
    { new: true },
  );

  if (!locked) return;

  try {
    await markCouponUsed(locked.couponCode, locked.studentId);
  } catch (err) {
    await Payment.findByIdAndUpdate(locked._id, { couponUsageMarked: false });
    throw err;
  }
};

const confirmParkingBooking = async (payment) => {
  if (!payment?.bookingId) return;
  await Booking.findByIdAndUpdate(payment.bookingId, {
    status: "confirmed",
    paymentStatus: "paid",
    couponCode: payment.couponCode || null,
    discountAmount: payment.discountAmount || 0,
    finalAmount: payment.amount,
  });
};

const releaseCarpoolSeat = async (payment) => {
  if (!payment?.carpoolRouteId || !payment?.studentId) return;

  const route = await CarpoolRoute.findById(payment.carpoolRouteId);
  if (!route || route.status === "completed" || route.status === "cancelled") {
    return;
  }

  const passengerIndex = route.passengers.findIndex(
    (p) => p.toString() === payment.studentId.toString(),
  );
  if (passengerIndex === -1) return;

  route.passengers.splice(passengerIndex, 1);
  route.availableSeats = Math.min(route.totalSeats, route.availableSeats + 1);
  if (route.status === "full") route.status = "open";
  await route.save();
};

// ── PARKING PAYMENT ───────────────────────────────────────────
// POST /api/payment/initiate/:bookingId
export const initiatePayment = async (req, res) => {
  const { STORE_ID, STORE_PASSWORD, IS_LIVE, SERVER_URL } = getSSL();

  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (booking.studentId.toString() !== req.user.id)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    if (booking.paymentStatus === "paid")
      return res.status(400).json({ success: false, message: "Already paid" });

    const student = await User.findById(req.user.id);
    const tranId = `EKST_${booking._id}_${Date.now()}`;

    // Coupon re-validation on backend — never trust frontend amount
    let finalAmount = booking.totalPrice;
    let discountAmount = 0;
    let couponCode = req.body.couponCode || null;

    if (couponCode) {
      const couponResult = await validateCouponLogic(
        couponCode,
        "parking",
        booking.totalPrice,
        req.user.id,
      );
      if (couponResult.valid) {
        finalAmount = couponResult.finalAmount;
        discountAmount = couponResult.discountAmount;
      } else {
        return res
          .status(400)
          .json({ success: false, message: couponResult.message });
      }
    }

    const data = {
      total_amount: finalAmount,
      currency: "BDT",
      tran_id: tranId,
      success_url: `${SERVER_URL}/api/payment/success`,
      fail_url: `${SERVER_URL}/api/payment/fail`,
      cancel_url: `${SERVER_URL}/api/payment/cancel`,
      ipn_url: `${SERVER_URL}/api/payment/ipn`,
      shipping_method: "No",
      product_name: "Parking Booking",
      product_category: "Service",
      product_profile: "general",
      cus_name: student.name,
      cus_email: student.email,
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: student.phone || "01700000000",
    };

    await Payment.create({
      contextType: "parking",
      bookingId: booking._id,
      studentId: req.user.id,
      amount: finalAmount,
      originalAmount: booking.totalPrice,
      discountAmount,
      couponCode,
      tranId,
    });

    const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      return res
        .status(200)
        .json({ success: true, url: apiResponse.GatewayPageURL });
    }

    return res
      .status(500)
      .json({ success: false, message: "Failed to initiate payment" });
  } catch (err) {
    console.error("initiatePayment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── CARPOOL PAYMENT ───────────────────────────────────────────
// POST /api/payment/carpool/initiate/:routeId
export const initiateCarpoolPayment = async (req, res) => {
  const { STORE_ID, STORE_PASSWORD, IS_LIVE, SERVER_URL } = getSSL();
  let createdPayment = null;

  try {
    const route = await CarpoolRoute.findById(req.params.routeId);
    if (!route)
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });

    const isPassenger = route.passengers.some(
      (p) => p.toString() === req.user.id.toString(),
    );
    if (!isPassenger)
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not a passenger on this ride",
        });

    const existingPaid = await Payment.findOne({
      carpoolRouteId: route._id,
      studentId: req.user.id,
      status: "paid",
    });
    if (existingPaid)
      return res
        .status(400)
        .json({
          success: false,
          message: "You have already paid for this ride",
        });

    const payer = await User.findById(req.user.id);
    const tranId = `EKSC_${route._id}_${req.user.id}_${Date.now()}`;
    const originalAmount = route.pricePerSeat;

    // Coupon re-validation
    let finalAmount = originalAmount;
    let discountAmount = 0;
    let couponCode = req.body.couponCode || null;

    if (couponCode) {
      const couponResult = await validateCouponLogic(
        couponCode,
        "carpool",
        originalAmount,
        req.user.id,
      );
      if (couponResult.valid) {
        finalAmount = couponResult.finalAmount;
        discountAmount = couponResult.discountAmount;
      } else {
        return res
          .status(400)
          .json({ success: false, message: couponResult.message });
      }
    }

    const data = {
      total_amount: finalAmount,
      currency: "BDT",
      tran_id: tranId,
      success_url: `${SERVER_URL}/api/payment/carpool/success`,
      fail_url: `${SERVER_URL}/api/payment/carpool/fail`,
      cancel_url: `${SERVER_URL}/api/payment/carpool/cancel`,
      ipn_url: `${SERVER_URL}/api/payment/ipn`,
      shipping_method: "No",
      product_name: `Carpool: ${route.origin.area} → ${route.destination.area}`,
      product_category: "Service",
      product_profile: "general",
      cus_name: payer.name,
      cus_email: payer.email,
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: payer.phone || "01700000000",
    };

    createdPayment = await Payment.create({
      contextType: "carpool",
      carpoolRouteId: route._id,
      studentId: req.user.id,
      amount: finalAmount,
      originalAmount,
      discountAmount,
      couponCode,
      tranId,
    });

    const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      return res
        .status(200)
        .json({ success: true, url: apiResponse.GatewayPageURL });
    }

    await Payment.findOneAndUpdate(
      { tranId },
      { status: "failed", gatewayResponse: apiResponse || {} },
    );
    await releaseCarpoolSeat({
      carpoolRouteId: route._id,
      studentId: req.user.id,
    });

    return res
      .status(500)
      .json({ success: false, message: "Failed to initiate carpool payment" });
  } catch (err) {
    console.error("initiateCarpoolPayment error:", err);
    if (createdPayment) {
      try {
        createdPayment.status = "failed";
        createdPayment.gatewayResponse = { error: err.message };
        await createdPayment.save();
        await releaseCarpoolSeat(createdPayment);
      } catch (cleanupErr) {
        console.error("carpool payment cleanup error:", cleanupErr);
      }
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── PARKING SUCCESS ───────────────────────────────────────────
// POST /api/payment/success
export const paymentSuccess = async (req, res) => {
  const { CLIENT_URL } = getSSL();
  try {
    const { tran_id, val_id, status } = req.body;
    if (!isGatewayValid(status)) return res.redirect(`${CLIENT_URL}/payment/fail`);

    const gatewayValid = await validateGatewayPayment(val_id);
    if (!gatewayValid)
      return res.redirect(`${CLIENT_URL}/payment/fail`);

    const payment = await Payment.findOne({ tranId: tran_id });
    if (!payment) return res.redirect(`${CLIENT_URL}/payment/fail`);
    const wasAlreadyPaid = payment.status === "paid";

    payment.status = "paid";
    payment.gatewayResponse = req.body;
    await payment.save();

    // Update booking with coupon and final amount info
    await confirmParkingBooking(payment);

    // Mark coupon used ONLY after successful payment
    if (!wasAlreadyPaid && payment.couponCode) {
      try {
        await markCouponUsedOnce(payment);
      } catch (e) {
        console.error("markCouponUsed error:", e);
      }
    }

    if (!wasAlreadyPaid) {
      try {
        const student = await User.findById(payment.studentId).select(
          "+fcmToken",
        );
        await sendPush(
          payment.studentId,
          student?.fcmToken || null,
          "Payment Successful",
          `৳${payment.amount} paid. Your booking is confirmed!`,
          "payment_success",
          { type: "parking" },
        );
      } catch {
        /* silent */
      }
    }

    return res.redirect(
      `${CLIENT_URL}/payment/success?tran_id=${tran_id}&type=parking`,
    );
  } catch (err) {
    console.error("paymentSuccess error:", err);
    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/fail`,
    );
  }
};

// ── CARPOOL SUCCESS ───────────────────────────────────────────
// POST /api/payment/carpool/success
export const carpoolPaymentSuccess = async (req, res) => {
  const { CLIENT_URL } = getSSL();
  try {
    const { tran_id, val_id, status } = req.body;
    if (!isGatewayValid(status)) return res.redirect(`${CLIENT_URL}/payment/fail`);

    const gatewayValid = await validateGatewayPayment(val_id);
    if (!gatewayValid) return res.redirect(`${CLIENT_URL}/payment/fail`);

    const payment = await Payment.findOne({ tranId: tran_id });
    if (!payment) return res.redirect(`${CLIENT_URL}/payment/fail`);
    const wasAlreadyPaid = payment.status === "paid";

    payment.status = "paid";
    payment.gatewayResponse = req.body;
    await payment.save();

    // Mark coupon used ONLY after confirmed carpool payment
    if (!wasAlreadyPaid && payment.couponCode) {
      try {
        await markCouponUsedOnce(payment);
      } catch (e) {
        console.error("markCouponUsed error:", e);
      }
    }

    if (!wasAlreadyPaid) {
      try {
        const passenger = await User.findById(payment.studentId).select(
          "+fcmToken",
        );
        await sendPush(
          payment.studentId,
          passenger?.fcmToken || null,
          "Carpool Payment Successful",
          `৳${payment.amount} paid. You're confirmed for the ride!`,
          "carpool_payment",
          { type: "carpool" },
        );
      } catch {
        /* silent */
      }
    }

    return res.redirect(
      `${CLIENT_URL}/payment/success?tran_id=${tran_id}&type=carpool`,
    );
  } catch (err) {
    console.error("carpoolPaymentSuccess error:", err);
    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/fail`,
    );
  }
};

// ── FAIL / CANCEL ─────────────────────────────────────────────
// POST /api/payment/fail
export const paymentFail = async (req, res) => {
  const { CLIENT_URL } = getSSL();
  try {
    const { tran_id } = req.body;
    const payment = await Payment.findOneAndUpdate(
      { tranId: tran_id, status: { $ne: "paid" } },
      { status: "failed", gatewayResponse: req.body },
      { new: true },
    );
    if (payment?.bookingId) {
      await Booking.findByIdAndUpdate(payment.bookingId, {
        status: "cancelled",
        cancelledBy: "student",
      });
    }
    // Coupon NOT counted as used on failure
    return res.redirect(`${CLIENT_URL}/payment/fail`);
  } catch (err) {
    console.error("paymentFail error:", err);
    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/fail`,
    );
  }
};

// POST /api/payment/carpool/fail
export const carpoolPaymentFail = async (req, res) => {
  const { CLIENT_URL } = getSSL();
  try {
    const { tran_id } = req.body;
    const payment = await Payment.findOneAndUpdate(
      { tranId: tran_id, status: { $ne: "paid" } },
      { status: "failed", gatewayResponse: req.body },
      { new: true },
    );
    if (payment) await releaseCarpoolSeat(payment);
    return res.redirect(`${CLIENT_URL}/payment/fail?type=carpool`);
  } catch (err) {
    console.error("carpoolPaymentFail error:", err);
    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/fail`,
    );
  }
};

// POST /api/payment/cancel
export const paymentCancel = async (req, res) => {
  const { CLIENT_URL } = getSSL();
  try {
    const { tran_id } = req.body;
    const payment = await Payment.findOneAndUpdate(
      { tranId: tran_id, status: { $ne: "paid" } },
      { status: "cancelled", gatewayResponse: req.body },
      { new: true },
    );
    if (payment?.bookingId) {
      await Booking.findByIdAndUpdate(payment.bookingId, {
        status: "cancelled",
        cancelledBy: "student",
      });
    }
    return res.redirect(`${CLIENT_URL}/payment/cancel`);
  } catch (err) {
    console.error("paymentCancel error:", err);
    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/cancel`,
    );
  }
};

// POST /api/payment/carpool/cancel
export const carpoolPaymentCancel = async (req, res) => {
  const { CLIENT_URL } = getSSL();
  try {
    const { tran_id } = req.body;
    const payment = await Payment.findOneAndUpdate(
      { tranId: tran_id, status: { $ne: "paid" } },
      { status: "cancelled", gatewayResponse: req.body },
      { new: true },
    );
    if (payment) await releaseCarpoolSeat(payment);
    return res.redirect(`${CLIENT_URL}/payment/cancel?type=carpool`);
  } catch (err) {
    console.error("carpoolPaymentCancel error:", err);
    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/cancel`,
    );
  }
};

// ── IPN ───────────────────────────────────────────────────────
// POST /api/payment/ipn
export const paymentIpn = async (req, res) => {
  try {
    const { tran_id, status, val_id } = req.body;
    if (isGatewayValid(status)) {
      const gatewayValid = await validateGatewayPayment(val_id);
      if (gatewayValid) {
        const payment = await Payment.findOne({ tranId: tran_id });
        if (!payment) return res.status(200).json({ success: true });
        const wasAlreadyPaid = payment.status === "paid";

        payment.status = "paid";
        payment.gatewayResponse = req.body;
        await payment.save();

        await confirmParkingBooking(payment);

        if (!wasAlreadyPaid && payment.couponCode) {
          try {
            await markCouponUsedOnce(payment);
          } catch {
            /* silent */
          }
        }
      }
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("paymentIpn error:", err);
    return res.status(200).json({ success: true });
  }
};
