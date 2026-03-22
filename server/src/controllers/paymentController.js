import SSLCommerzPayment from "sslcommerz-lts";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import CarpoolRoute from "../models/CarpoolRoute.js";
import User from "../models/User.js";

const getSSL = () => ({
  STORE_ID: process.env.SSLCOMMERZ_STORE_ID,
  STORE_PASSWORD: process.env.SSLCOMMERZ_STORE_PASSWORD,
  IS_LIVE: process.env.SSLCOMMERZ_IS_LIVE === "true",
  SERVER_URL:
    process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
});

// ── PARKING PAYMENT ───────────────────────────────────────────
// POST /api/payment/initiate/:bookingId
export const initiatePayment = async (req, res) => {
  const { STORE_ID, STORE_PASSWORD, IS_LIVE, SERVER_URL, CLIENT_URL } =
    getSSL();

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

    const data = {
      total_amount: booking.totalPrice,
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
      amount: booking.totalPrice,
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
// Called AFTER joining — passenger pays for their seat
export const initiateCarpoolPayment = async (req, res) => {
  const { STORE_ID, STORE_PASSWORD, IS_LIVE, SERVER_URL, CLIENT_URL } =
    getSSL();

  try {
    const route = await CarpoolRoute.findById(req.params.routeId);
    if (!route)
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });

    // Must be a confirmed passenger
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

    // Check not already paid
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
    const amount = route.pricePerSeat;

    const data = {
      total_amount: amount,
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

    await Payment.create({
      contextType: "carpool",
      carpoolRouteId: route._id,
      studentId: req.user.id,
      amount,
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
      .json({ success: false, message: "Failed to initiate carpool payment" });
  } catch (err) {
    console.error("initiateCarpoolPayment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ── SHARED SUCCESS/FAIL/CANCEL ────────────────────────────────
// POST /api/payment/success  (parking)
export const paymentSuccess = async (req, res) => {
  const { STORE_ID, STORE_PASSWORD, IS_LIVE, CLIENT_URL } = getSSL();
  try {
    const { tran_id, val_id, status } = req.body;
    if (status !== "VALID" && status !== "VALIDATED")
      return res.redirect(`${CLIENT_URL}/payment/fail`);

    const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
    const validation = await sslcz.validate({ val_id });
    if (validation?.status !== "VALID" && validation?.status !== "VALIDATED")
      return res.redirect(`${CLIENT_URL}/payment/fail`);

    const payment = await Payment.findOneAndUpdate(
      { tranId: tran_id },
      { status: "paid", gatewayResponse: req.body },
      { new: true },
    );
    if (!payment) return res.redirect(`${CLIENT_URL}/payment/fail`);

    await Booking.findByIdAndUpdate(payment.bookingId, {
      status: "confirmed",
      paymentStatus: "paid",
    });

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

// POST /api/payment/carpool/success
export const carpoolPaymentSuccess = async (req, res) => {
  const { STORE_ID, STORE_PASSWORD, IS_LIVE, CLIENT_URL } = getSSL();
  try {
    const { tran_id, val_id, status } = req.body;
    if (status !== "VALID" && status !== "VALIDATED")
      return res.redirect(`${CLIENT_URL}/payment/fail`);

    const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
    const validation = await sslcz.validate({ val_id });
    if (validation?.status !== "VALID" && validation?.status !== "VALIDATED")
      return res.redirect(`${CLIENT_URL}/payment/fail`);

    const payment = await Payment.findOneAndUpdate(
      { tranId: tran_id },
      { status: "paid", gatewayResponse: req.body },
      { new: true },
    );
    if (!payment) return res.redirect(`${CLIENT_URL}/payment/fail`);

    console.log(
      `✅ CARPOOL PAYMENT: Route ${payment.carpoolRouteId} — Passenger ${payment.studentId} paid ৳${payment.amount}`,
    );

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

// POST /api/payment/fail
export const paymentFail = async (req, res) => {
  const { CLIENT_URL } = getSSL();
  try {
    const { tran_id } = req.body;
    const payment = await Payment.findOneAndUpdate(
      { tranId: tran_id },
      { status: "failed", gatewayResponse: req.body },
      { new: true },
    );
    if (payment?.bookingId) {
      await Booking.findByIdAndUpdate(payment.bookingId, {
        status: "cancelled",
        cancelledBy: "student",
      });
    }
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
    await Payment.findOneAndUpdate(
      { tranId: tran_id },
      { status: "failed", gatewayResponse: req.body },
      { new: true },
    );
    // Do NOT remove passenger from ride — they can retry payment
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
      { tranId: tran_id },
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
    await Payment.findOneAndUpdate(
      { tranId: tran_id },
      { status: "cancelled", gatewayResponse: req.body },
      { new: true },
    );
    return res.redirect(`${CLIENT_URL}/payment/cancel?type=carpool`);
  } catch (err) {
    console.error("carpoolPaymentCancel error:", err);
    return res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/payment/cancel`,
    );
  }
};

// POST /api/payment/ipn  (handles both)
export const paymentIpn = async (req, res) => {
  const { STORE_ID, STORE_PASSWORD, IS_LIVE } = getSSL();
  try {
    const { tran_id, status, val_id } = req.body;
    if (status === "VALID" || status === "VALIDATED") {
      const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
      const validation = await sslcz.validate({ val_id });
      if (
        validation?.status === "VALID" ||
        validation?.status === "VALIDATED"
      ) {
        const payment = await Payment.findOneAndUpdate(
          { tranId: tran_id },
          { status: "paid", gatewayResponse: req.body },
          { new: true },
        );
        if (payment?.bookingId) {
          await Booking.findByIdAndUpdate(payment.bookingId, {
            status: "confirmed",
            paymentStatus: "paid",
          });
        }
      }
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("paymentIpn error:", err);
    return res.status(200).json({ success: true });
  }
};
