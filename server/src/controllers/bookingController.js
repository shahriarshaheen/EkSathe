import { validationResult } from "express-validator";
import Booking from "../models/Booking.js";

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

    // Conflict check — same spot, same date, overlapping time
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

    return res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error("createBooking error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/bookings/my — student sees their own bookings
// Populates homeownerId so the frontend can show Rate button
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ studentId: req.user.id })
      .populate("homeownerId", "name photoUrl trustScore")
      .sort({ createdAt: -1 });

    // Reshape so frontend gets booking.homeowner instead of booking.homeownerId
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

// GET /api/bookings/spot/:spotId — get bookings for a spot (homeowner/admin)
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

// PATCH /api/bookings/:id/cancel — cancel a booking
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
      return res
        .status(403)
        .json({
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

// GET /api/bookings/homeowner — homeowner sees bookings for their spots
export const getHomeownerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ homeownerId: req.user.id })
      .populate("studentId", "name photoUrl trustScore")
      .sort({ createdAt: -1 });

    // Reshape so frontend gets booking.student
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
