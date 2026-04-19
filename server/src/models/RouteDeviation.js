import mongoose from "mongoose";

// Stores deviation events so passengers can poll for in-app alerts
const routeDeviationSchema = new mongoose.Schema(
  {
    carpoolRouteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarpoolRoute",
      required: true,
      index: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The driver's location at time of deviation
    deviationLat: { type: Number, required: true },
    deviationLng: { type: Number, required: true },
    // Distance from planned route in metres
    distanceMetres: { type: Number, required: true },
    // Track which passengers have acknowledged (dismissed) the alert
    acknowledgedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Whether the driver returned to route (deviation resolved)
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-delete deviation records after 24 hours (they're transient alerts)
routeDeviationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400 }
);

export default mongoose.model("RouteDeviation", routeDeviationSchema);