import { validationResult } from "express-validator";
import Booking from "../models/Booking.js";
import { sendPush } from "../services/pushService.js";
import User from "../models/User.js";

// POST /api/bookings — student creates a booking
export const createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, message: errors.array()[0].msg });
  }

  try {
    const { spotId, homeownerId, date, startTime, endTime, totalPrice } =
      req.body;

    const conflict = await Booking.findOne({
      spotId,
      date,
      status: { $ne: "cancelled" },
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "This slot is already booked. Please choose a different time.",
      });
    }

    const booking = await Booking.create({
      spotId,
      studentId: req.user.id,
      homeownerId,
      date,
      startTime,
      endTime,
      totalPrice,
    });

    // Push notification to homeowner — saves to DB + sends FCM
    try {
      const homeowner = await User.findById(homeownerId).select("+fcmToken");
      await sendPush(
        homeownerId,
        homeowner?.fcmToken || null,
        "New Booking Request",
        `A student has booked your spot for ${date}`,
        "booking_request",
        { bookingId: booking._id.toString() }
      );
    } catch { /* silent — never crash the booking */ }

    return res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error("createBooking error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/bookings/my — student sees their own bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id })
      .populate("homeownerId", "name photoUrl trustScore")
      .sort({ createdAt: -1 });

    const shaped = bookings.map((b) => {
      const obj = b.toObject();
      obj.homeowner = obj.homeownerId;
      return obj;
    });

    return res.status(200).json({ success: true, data: shaped });
  } catch (err) {
    console.error("getMyBookings error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/bookings/spot/:spotId
export const getSpotBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      spotId: req.params.spotId,
      status: { $ne: "cancelled" },
    }).sort({ date: 1, startTime: 1 });

    return res.status(200).json({ success: true, data: bookings });
  } catch (err) {
    console.error("getSpotBookings error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ success: false, message: errors.array()[0].msg });
  }

  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const isStudent = booking.studentId.toString() === req.user.id;
    const isHomeowner = booking.homeownerId.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isStudent && !isHomeowner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    if (booking.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    booking.cancelledBy = req.body.cancelledBy;
    await booking.save();

    return res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.error("cancelBooking error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/bookings/homeowner
export const getHomeownerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ homeownerId: req.user.id })
      .populate("studentId", "name photoUrl trustScore")
      .sort({ createdAt: -1 });

    const shaped = bookings.map((b) => {
      const obj = b.toObject();
      obj.student = obj.studentId;
      return obj;
    });

    return res.status(200).json({ success: true, data: shaped });
  } catch (err) {
    console.error("getHomeownerBookings error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};