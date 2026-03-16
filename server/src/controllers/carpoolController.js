import CarpoolRoute from "../models/CarpoolRoute.js";
import UNIVERSITY_ROUTES from "../config/universityRoutes.js";

// GET /api/carpool/presets
export const getPresetRoutes = (req, res) => {
  res.json({ success: true, data: UNIVERSITY_ROUTES });
};

// GET /api/carpool/routes
export const getRoutes = async (req, res) => {
  try {
    const { genderSafe, presetRouteId, date } = req.query;
    const filter = { status: "open" };

    if (genderSafe === "true") filter.genderSafe = true;
    if (presetRouteId) filter.presetRouteId = presetRouteId;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      filter.departureTime = { $gte: start, $lte: end };
    }

    const routes = await CarpoolRoute.find(filter)
      .populate("driver", "name trustScore")
      .sort({ departureTime: 1 });

    res.json({ success: true, data: routes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/carpool/routes
export const createRoute = async (req, res) => {
  try {
    const {
      presetRouteId, origin, destination,
      departureTime, totalSeats, pricePerSeat,
      genderSafe, notes,
    } = req.body;

    if (presetRouteId) {
      const preset = UNIVERSITY_ROUTES.find((r) => r.id === presetRouteId);
      if (!preset) {
        return res.status(400).json({ success: false, message: "Invalid preset route ID." });
      }
    }

    const route = await CarpoolRoute.create({
      driver:         req.user.id,
      presetRouteId:  presetRouteId || null,
      origin,
      destination,
      departureTime,
      totalSeats,
      availableSeats: totalSeats,
      pricePerSeat,
      genderSafe:     genderSafe || false,
      notes,
    });

    const populated = await route.populate("driver", "name trustScore");
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// POST /api/carpool/routes/:id/join
export const joinRoute = async (req, res) => {
  try {
    const route = await CarpoolRoute.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: "Route not found." });
    }
    if (route.status !== "open") {
      return res.status(400).json({ success: false, message: "This ride is no longer open." });
    }
    if (route.driver.toString() === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot join your own ride." });
    }
    const alreadyJoined = route.passengers.some(
      (p) => p.toString() === req.user.id.toString()
    );
    if (alreadyJoined) {
      return res.status(400).json({ success: false, message: "You already joined this ride." });
    }
    if (route.availableSeats < 1) {
      return res.status(400).json({ success: false, message: "No seats available." });
    }

    route.passengers.push(req.user.id);
    route.availableSeats -= 1;
    if (route.availableSeats === 0) route.status = "full";
    await route.save();

    const populated = await route.populate("driver passengers", "name trustScore");
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/carpool/routes/:id/leave
export const leaveRoute = async (req, res) => {
  try {
    const route = await CarpoolRoute.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: "Route not found." });
    }
    const index = route.passengers.findIndex(
      (p) => p.toString() === req.user.id.toString()
    );
    if (index === -1) {
      return res.status(400).json({ success: false, message: "You are not a passenger on this ride." });
    }

    route.passengers.splice(index, 1);
    route.availableSeats += 1;
    if (route.status === "full") route.status = "open";
    await route.save();

    res.json({ success: true, message: "You have left the ride." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/carpool/my
export const getMyRides = async (req, res) => {
  try {
    const [posted, joined] = await Promise.all([
      CarpoolRoute.find({ driver: req.user.id })
        .sort({ departureTime: -1 }),
      CarpoolRoute.find({ passengers: req.user.id })
        .populate("driver", "name trustScore")
        .sort({ departureTime: -1 }),
    ]);
    res.json({ success: true, data: { posted, joined } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/carpool/routes/:id/cancel  —  driver cancels their own ride
export const cancelRoute = async (req, res) => {
  try {
    const route = await CarpoolRoute.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ success: false, message: "Route not found." });
    }
    if (route.driver.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Only the driver can cancel this ride." });
    }
    if (route.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Ride is already cancelled." });
    }
    if (route.status === "completed") {
      return res.status(400).json({ success: false, message: "Cannot cancel a completed ride." });
    }

    route.status = "cancelled";
    await route.save();

    res.json({ success: true, message: "Ride has been cancelled." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};