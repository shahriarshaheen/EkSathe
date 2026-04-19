import CarpoolRoute from "../models/CarpoolRoute.js";
import RouteDeviation from "../models/RouteDeviation.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEVIATION_THRESHOLD_METRES = 500;

// Minimum time between consecutive deviation emails per ride (ms)
// Prevents inbox flooding if driver stays off-route for a while
const EMAIL_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// In-memory cooldown tracker: key = `${routeId}` → last email timestamp
const lastEmailSent = new Map();

// ─── Haversine distance (metres) between two lat/lng points ──────────────────
function haversineMetres(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in metres
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Minimum distance from a point to a polyline ─────────────────────────────
// Returns the shortest distance (metres) from (lat, lng) to any point in the
// polyline array. Checks each segment's perpendicular projection as well as
// the segment endpoints for maximum accuracy.
function distanceToPolylineMetres(lat, lng, polyline) {
  if (!polyline || polyline.length === 0) return 0;
  if (polyline.length === 1) {
    return haversineMetres(lat, lng, polyline[0].lat, polyline[0].lng);
  }

  let minDist = Infinity;

  for (let i = 0; i < polyline.length - 1; i++) {
    const A = polyline[i];
    const B = polyline[i + 1];

    // Treat the segment A→B in a flat (equirectangular) projection for
    // the perpendicular calculation — accurate enough at Dhaka-scale distances
    const dx = B.lng - A.lng;
    const dy = B.lat - A.lat;
    const lenSq = dx * dx + dy * dy;

    let t = 0;
    if (lenSq > 0) {
      t = ((lng - A.lng) * dx + (lat - A.lat) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
    }

    const closestLat = A.lat + t * dy;
    const closestLng = A.lng + t * dx;
    const d = haversineMetres(lat, lng, closestLat, closestLng);
    if (d < minDist) minDist = d;
  }

  return minDist;
}

// ─── Build deviation alert email ─────────────────────────────────────────────
function buildDeviationEmail(passenger, driverName, route, distanceMetres, mapsLink) {
  const dist = Math.round(distanceMetres);
  const routeLabel = `${route.origin.area} → ${route.destination.area}`;

  return {
    from: `"EkSathe Safety" <${process.env.EMAIL_USER}>`,
    to: passenger.email,
    subject: `⚠️ Route Deviation Alert — Your driver may have gone off-route`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#111827;padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="color:#0d9488;font-size:18px;font-weight:700;letter-spacing:-0.5px;">EkSathe</span>
                </td>
                <td align="right">
                  <span style="background:#f59e0b;color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:0.5px;">ROUTE ALERT</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Alert Banner -->
        <tr>
          <td style="background:#fffbeb;border-left:4px solid #f59e0b;padding:20px 32px;">
            <p style="margin:0;font-size:20px;font-weight:700;color:#92400e;">⚠️ Route Deviation Detected</p>
            <p style="margin:6px 0 0;font-size:13px;color:#b45309;">Your driver is ${dist}m away from the planned route</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px 0;">
            <p style="margin:0 0 16px;font-size:15px;color:#374151;">
              Hi <strong>${passenger.name}</strong>,
            </p>
            <p style="margin:0 0 20px;font-size:15px;color:#111827;line-height:1.6;">
              Your driver <strong>${driverName}</strong> has deviated more than
              <strong>500 metres</strong> from the planned route for your ride
              <strong>${routeLabel}</strong>.
            </p>

            <!-- Info card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;margin-bottom:24px;">
              <tr><td style="padding:16px 20px;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#78350f;width:130px;">Route</td>
                    <td style="padding:5px 0;font-size:14px;font-weight:600;color:#111827;">${routeLabel}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#78350f;">Driver</td>
                    <td style="padding:5px 0;font-size:14px;color:#111827;">${driverName}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;font-size:13px;color:#78350f;">Deviation</td>
                    <td style="padding:5px 0;font-size:14px;font-weight:700;color:#dc2626;">${dist} metres off-route</td>
                  </tr>
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 24px;">
            <a href="${mapsLink}" style="display:inline-block;background:#f59e0b;color:#fff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;">
              View Driver Location
            </a>
          </td>
        </tr>

        <!-- Safety tips -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#991b1b;">What should you do?</p>
                <p style="margin:0 0 6px;font-size:13px;color:#7f1d1d;">1. Stay calm and ask your driver about the route change</p>
                <p style="margin:0 0 6px;font-size:13px;color:#7f1d1d;">2. If you feel unsafe, use the SOS button in EkSathe</p>
                <p style="margin:0;font-size:13px;color:#7f1d1d;">3. Emergency services: <strong>999</strong></p>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;">
            <p style="margin:0;font-size:12px;color:#6b7280;">
              This alert was automatically sent by <strong>EkSathe Safety System</strong>.
            </p>
            <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">
              © ${new Date().getFullYear()} EkSathe — Smart Campus Mobility, Dhaka, Bangladesh
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

// ─── START TRIP ───────────────────────────────────────────────────────────────
// POST /api/carpool/routes/:id/start
// Driver calls this when they begin the ride. Body: { polyline: [{lat, lng}] }
// Stores the planned route polyline and marks the trip as active.
export const startTrip = async (req, res) => {
  try {
    const route = await CarpoolRoute.findById(req.params.id);
    if (!route) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found." });
    }
    if (route.driver.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Only the driver can start this trip." });
    }
    if (route.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot start a cancelled ride." });
    }
    if (route.tripActive) {
      return res
        .status(400)
        .json({ success: false, message: "Trip is already active." });
    }

    const { polyline } = req.body;
    if (!polyline || !Array.isArray(polyline) || polyline.length < 2) {
      return res.status(400).json({
        success: false,
        message: "A valid polyline with at least 2 points is required.",
      });
    }

    // Validate each point has lat/lng
    const validPolyline = polyline.every(
      (p) => typeof p.lat === "number" && typeof p.lng === "number"
    );
    if (!validPolyline) {
      return res
        .status(400)
        .json({ success: false, message: "Each polyline point must have lat and lng." });
    }

    route.plannedPolyline = polyline;
    route.tripActive = true;
    route.tripStartedAt = new Date();
    await route.save();

    return res.status(200).json({
      success: true,
      message: "Trip started. Route polyline saved.",
    });
  } catch (err) {
    console.error("startTrip error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── END TRIP ─────────────────────────────────────────────────────────────────
// PATCH /api/carpool/routes/:id/end-trip
// Driver calls when the ride is over. Marks trip inactive.
export const endTrip = async (req, res) => {
  try {
    const route = await CarpoolRoute.findById(req.params.id);
    if (!route) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found." });
    }
    if (route.driver.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Only the driver can end this trip." });
    }

    route.tripActive = false;
    route.status = "completed";
    await route.save();

    // Clean up cooldown tracker
    lastEmailSent.delete(route._id.toString());

    return res.status(200).json({ success: true, message: "Trip ended." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PING LOCATION ────────────────────────────────────────────────────────────
// POST /api/carpool/routes/:id/location
// Driver's app calls this every ~10s with current GPS position.
// Body: { lat, lng }
// Checks deviation and fires alerts if needed.
export const pingLocation = async (req, res) => {
  try {
    const route = await CarpoolRoute.findById(req.params.id).populate(
      "passengers",
      "name email"
    );

    if (!route) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found." });
    }
    if (route.driver.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Only the driver can ping location." });
    }
    if (!route.tripActive) {
      return res
        .status(400)
        .json({ success: false, message: "Trip is not active. Call /start first." });
    }

    const { lat, lng } = req.body;
    if (typeof lat !== "number" || typeof lng !== "number") {
      return res
        .status(400)
        .json({ success: false, message: "lat and lng must be numbers." });
    }

    // If no polyline stored, nothing to compare against
    if (!route.plannedPolyline || route.plannedPolyline.length < 2) {
      return res.status(200).json({ success: true, deviated: false });
    }

    const distance = distanceToPolylineMetres(lat, lng, route.plannedPolyline);
    const deviated = distance > DEVIATION_THRESHOLD_METRES;

    if (deviated) {
      // Create a deviation record (in-app notification for passengers)
      const deviationRecord = await RouteDeviation.create({
        carpoolRouteId: route._id,
        driverId: route.driver,
        deviationLat: lat,
        deviationLng: lng,
        distanceMetres: Math.round(distance),
      });

      // Send email alerts — with cooldown to avoid spamming
      const routeKey = route._id.toString();
      const now = Date.now();
      const lastSent = lastEmailSent.get(routeKey) || 0;

      if (now - lastSent > EMAIL_COOLDOWN_MS && route.passengers.length > 0) {
        lastEmailSent.set(routeKey, now);

        const driver = await User.findById(route.driver).select("name");
        const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        // Fire-and-forget — don't block the response
        Promise.allSettled(
          route.passengers.map((passenger) =>
            transporter.sendMail(
              buildDeviationEmail(passenger, driver.name, route, distance, mapsLink)
            )
          )
        ).catch((err) => console.error("Deviation email error:", err));
      }

      return res.status(200).json({
        success: true,
        deviated: true,
        distanceMetres: Math.round(distance),
        deviationId: deviationRecord._id,
      });
    }

    // If driver is back on route, resolve any existing open deviation
    await RouteDeviation.updateMany(
      { carpoolRouteId: route._id, resolved: false },
      { resolved: true }
    );

    return res.status(200).json({
      success: true,
      deviated: false,
      distanceMetres: Math.round(distance),
    });
  } catch (err) {
    console.error("pingLocation error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET DEVIATION ALERTS (passenger polling) ─────────────────────────────────
// GET /api/carpool/routes/:id/deviation-alerts
// Passengers call this on an interval to check for active deviation alerts.
// Returns the latest unresolved deviation if one exists.
export const getDeviationAlerts = async (req, res) => {
  try {
    const route = await CarpoolRoute.findById(req.params.id).select(
      "driver passengers tripActive"
    );
    if (!route) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found." });
    }

    // Only driver and confirmed passengers can poll
    const userId = req.user.id;
    const isDriver = route.driver.toString() === userId;
    const isPassenger = route.passengers
      .map((p) => p.toString())
      .includes(userId);

    if (!isDriver && !isPassenger) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    // Find the latest unresolved deviation that this user hasn't dismissed
    const alert = await RouteDeviation.findOne({
      carpoolRouteId: route._id,
      resolved: false,
      acknowledgedBy: { $ne: req.user.id },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tripActive: route.tripActive,
      alert: alert
        ? {
            _id: alert._id,
            distanceMetres: alert.distanceMetres,
            deviationLat: alert.deviationLat,
            deviationLng: alert.deviationLng,
            createdAt: alert.createdAt,
          }
        : null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ACKNOWLEDGE ALERT ────────────────────────────────────────────────────────
// POST /api/carpool/routes/:id/deviation-alerts/:alertId/ack
// Passenger dismisses an alert so it stops showing.
export const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await RouteDeviation.findById(req.params.alertId);
    if (!alert) {
      return res
        .status(404)
        .json({ success: false, message: "Alert not found." });
    }

    if (!alert.acknowledgedBy.includes(req.user.id)) {
      alert.acknowledgedBy.push(req.user.id);
      await alert.save();
    }

    return res.status(200).json({ success: true, message: "Alert dismissed." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};