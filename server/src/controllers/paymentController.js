import SSLCommerzPayment from "sslcommerz-lts";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

// POST /api/payment/initiate/:bookingId
export const initiatePayment = async (req, res) => {
  const STORE_ID = process.env.SSLCOMMERZ_STORE_ID;
  const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === "true";

  try {
    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ success: false, message: "Already paid" });
    }

    const student = await User.findById(req.user.id);

    const tranId = `EKST_${booking._id}_${Date.now()}`;

    const data = {
      total_amount: booking.totalPrice,
      currency: "BDT",
      tran_id: tranId,
      success_url: `${process.env.SERVER_URL}/api/payment/success`,
      fail_url: `${process.env.SERVER_URL}/api/payment/fail`,
      cancel_url: `${process.env.SERVER_URL}/api/payment/cancel`,
      ipn_url: `${process.env.SERVER_URL}/api/payment/ipn`,
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
      bookingId: booking._id,
      studentId: req.user.id,
      amount: booking.totalPrice,
      tranId,
    });

    const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      return res.status(200).json({
        success: true,
        url: apiResponse.GatewayPageURL,
      });
    }

    return res.status(500).json({ success: false, message: "Failed to initiate payment" });
  } catch (err) {
    console.error("initiatePayment error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/payment/success
export const paymentSuccess = async (req, res) => {
  const STORE_ID = process.env.SSLCOMMERZ_STORE_ID;
  const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === "true";

  try {
    const { tran_id, val_id, status } = req.body;

    if (status !== "VALID" && status !== "VALIDATED") {
      return res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
    }

    const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
    const validation = await sslcz.validate({ val_id });

    if (validation?.status !== "VALID" && validation?.status !== "VALIDATED") {
      return res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
    }

    const payment = await Payment.findOneAndUpdate(
      { tranId: tran_id },
      { status: "paid", gatewayResponse: req.body },
      { new: true }
    );

    if (!payment) {
      return res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
    }

    await Booking.findByIdAndUpdate(payment.bookingId, {
      status: "confirmed",
      paymentStatus: "paid",
    });

    const booking = await Booking.findById(payment.bookingId);
    console.log(`✅ HOMEOWNER NOTIFICATION: Booking ${booking._id} confirmed. Amount: ৳${payment.amount}`);

    return res.redirect(`${process.env.CLIENT_URL}/payment/success?tran_id=${tran_id}`);
  } catch (err) {
    console.error("paymentSuccess error:", err);
    return res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
  }
};

// POST /api/payment/fail
export const paymentFail = async (req, res) => {
  try {
    const { tran_id } = req.body;

    const payment = await Payment.findOneAndUpdate(
      { tranId: tran_id },
      { status: "failed", gatewayResponse: req.body },
      { new: true }
    );

    if (payment) {
      await Booking.findByIdAndUpdate(payment.bookingId, {
        status: "cancelled",
        cancelledBy: "student",
      });
    }

    return res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
  } catch (err) {
    console.error("paymentFail error:", err);
    return res.redirect(`${process.env.CLIENT_URL}/payment/fail`);
  }
};

// POST /api/payment/cancel
export const paymentCancel = async (req, res) => {
  try {
    const { tran_id } = req.body;

    const payment = await Payment.findOneAndUpdate(
      { tranId: tran_id },
      { status: "cancelled", gatewayResponse: req.body },
      { new: true }
    );

    if (payment) {
      await Booking.findByIdAndUpdate(payment.bookingId, {
        status: "cancelled",
        cancelledBy: "student",
      });
    }

    return res.redirect(`${process.env.CLIENT_URL}/payment/cancel`);
  } catch (err) {
    console.error("paymentCancel error:", err);
    return res.redirect(`${process.env.CLIENT_URL}/payment/cancel`);
  }
};

// POST /api/payment/ipn
export const paymentIpn = async (req, res) => {
  const STORE_ID = process.env.SSLCOMMERZ_STORE_ID;
  const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const IS_LIVE = process.env.SSLCOMMERZ_IS_LIVE === "true";

  try {
    const { tran_id, status, val_id } = req.body;

    if (status === "VALID" || status === "VALIDATED") {
      const sslcz = new SSLCommerzPayment(STORE_ID, STORE_PASSWORD, IS_LIVE);
      const validation = await sslcz.validate({ val_id });

      if (validation?.status === "VALID" || validation?.status === "VALIDATED") {
        const payment = await Payment.findOneAndUpdate(
          { tranId: tran_id },
          { status: "paid", gatewayResponse: req.body },
          { new: true }
        );

        if (payment) {
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