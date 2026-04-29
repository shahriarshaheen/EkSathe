import CarpoolRoute from "../models/CarpoolRoute.js";
import User from "../models/User.js";
import {
  getCheckinWindow,
  isCheckinWindowOpen,
  isDeparturePasssed,
} from "../utils/checkinUtils.js";

// ── POST /api/carpool/:id/checkin ─────────────────────────────────────────────
// Passenger taps "I've Arrived" — marks them as checked in
export const submitCheckin = async (req, res) => {
  try {
    const { id }  = req.params;
    const userId  = req.user.id.toString();

    const ride = await CarpoolRoute.findById(id);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found." });
    }

    if (ride.status === "cancelled") {
      return res.status(400).json({ success: false, message: "This ride has been cancelled." });
    }

    // Only passengers check in — driver is always "there"
    const isPassenger = ride.passengers.some((p) => p.toString() === userId);
    if (!isPassenger) {
      return res.status(403).json({ success: false, message: "Only passengers can check in." });
    }

    if (!isCheckinWindowOpen(ride.departureTime)) {
      const { windowOpen } = getCheckinWindow(ride.departureTime);
      if (new Date() < windowOpen) {
        const minsUntilOpen = Math.ceil((windowOpen - new Date()) / 60000);
        return res.status(400).json({
          success: false,
          message: `Check-in window opens ${minsUntilOpen} minute${minsUntilOpen !== 1 ? "s" : ""} before departure.`,
          windowOpen,
        });
      }
      return res.status(400).json({
        success: false,
        message: "Check-in window has closed. Departure time has passed.",
      });
    }

    // Check if already checked in
    const alreadyCheckedIn = ride.checkins?.some(
      (c) => c.userId.toString() === userId
    );
    if (alreadyCheckedIn) {
      return res.status(400).json({ success: false, message: "You have already checked in." });
    }

    // Add check-in record
    if (!ride.checkins) ride.checkins = [];
    ride.checkins.push({ userId, checkedInAt: new Date() });
    await ride.save();

    return res.status(200).json({
      success: true,
      message: "Check-in confirmed! See you at the pickup point.",
      checkedInAt: new Date(),
    });
  } catch (err) {
    console.error("submitCheckin error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── GET /api/carpool/:id/checkin-status ───────────────────────────────────────
// Driver sees all passengers' check-in status; passengers see their own
export const getCheckinStatus = async (req, res) => {
  try {
    const { id }  = req.params;
    const userId  = req.user.id.toString();

    const ride = await CarpoolRoute.findById(id)
      .populate("passengers", "name photoUrl trustScore")
      .populate("driver",     "name photoUrl");

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found." });
    }

    const driverId = (ride.driver._id || ride.driver).toString();
    const isDriver    = driverId === userId;
    const isPassenger = ride.passengers.some(
      (p) => (p._id || p).toString() === userId
    );

    if (!isDriver && !isPassenger) {
      return res.status(403).json({ success: false, message: "You are not part of this ride." });
    }

    const { windowOpen, windowClose } = getCheckinWindow(ride.departureTime);
    const now = new Date();
    const windowStatus =
      now < windowOpen   ? "upcoming" :
      now <= windowClose ? "open"     : "closed";

    const minutesUntilOpen = Math.max(0, Math.ceil((windowOpen - now) / 60000));

    // Build passenger status list
    const passengerStatuses = ride.passengers.map((p) => {
      const pId     = (p._id || p).toString();
      const checkin = ride.checkins?.find((c) => c.userId.toString() === pId);
      return {
        userId:      pId,
        name:        p.name,
        photoUrl:    p.photoUrl ?? null,
        trustScore:  p.trustScore ?? 0,
        checkedIn:   !!checkin,
        checkedInAt: checkin?.checkedInAt ?? null,
      };
    });

    const totalPassengers = passengerStatuses.length;
    const checkedInCount  = passengerStatuses.filter((p) => p.checkedIn).length;

    const myStatus = isPassenger
      ? passengerStatuses.find((p) => p.userId === userId) ?? null
      : null;

    return res.status(200).json({
      success: true,
      data: {
        rideId:           id,
        departureTime:    ride.departureTime,
        windowOpen,
        windowClose,
        windowStatus,
        minutesUntilOpen,
        totalPassengers,
        checkedInCount,
        passengers:  isDriver    ? passengerStatuses : undefined,
        myStatus:    isPassenger ? myStatus          : undefined,
      },
    });
  } catch (err) {
    console.error("getCheckinStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── PATCH /api/carpool/:id/auto-cancel-no-show ────────────────────────────────
// Called at/after departure — removes passengers who never checked in
export const autoCancelNoShows = async (req, res) => {
  try {
    const { id }  = req.params;
    const userId  = req.user.id.toString();

    const ride = await CarpoolRoute.findById(id)
      .populate("passengers", "name email trustScore");

    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found." });
    }

    const isDriver = ride.driver.toString() === userId;
    if (!isDriver) {
      return res.status(403).json({
        success: false,
        message: "Only the driver can trigger no-show cancellation.",
      });
    }

    if (ride.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Ride is already cancelled." });
    }

    // Only allowed at or after departure time
    if (new Date() < new Date(ride.departureTime)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel no-shows before departure time.",
      });
    }

    // Find passengers who never checked in
    const noShows = ride.passengers.filter((p) => {
      const pId = (p._id || p).toString();
      return !ride.checkins?.some((c) => c.userId.toString() === pId);
    });

    if (noShows.length === 0) {
      return res.status(200).json({
        success: true,
        message: "All passengers checked in — no no-shows.",
        removedCount:      0,
        removedPassengers: [],
      });
    }

    const noShowIds = noShows.map((p) => (p._id || p).toString());

    // Remove no-shows from passengers array
    ride.passengers = ride.passengers.filter(
      (p) => !noShowIds.includes((p._id || p).toString())
    );

    // Free up their seats
    ride.availableSeats = Math.min(
      ride.totalSeats,
      ride.availableSeats + noShowIds.length
    );

    // Update status if it was full
    if (ride.status === "full" && ride.availableSeats > 0) {
      ride.status = "open";
    }

    await ride.save();

    // Apply trust score penalty (-2) to each no-show
    await Promise.all(
      noShowIds.map((uid) =>
        User.findByIdAndUpdate(uid, {
          $inc: { trustScore: -2 },
        })
      )
    );

    return res.status(200).json({
      success: true,
      message: `${noShowIds.length} no-show${noShowIds.length !== 1 ? "s" : ""} removed.`,
      removedCount:      noShowIds.length,
      removedPassengers: noShows.map((p) => ({
        userId: (p._id || p).toString(),
        name:   p.name,
      })),
    });
  } catch (err) {
    console.error("autoCancelNoShows error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};