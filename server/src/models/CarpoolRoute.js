import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true },
    area:  { type: String, required: true },
    lat:   { type: Number, required: true },
    lng:   { type: Number, required: true },
  },
  { _id: false }
);

const carpoolRouteSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    presetRouteId: {
      type: String,
      default: null,
    },
    origin:      { type: locationSchema, required: true },
    destination: { type: locationSchema, required: true },
    departureTime: { type: Date, required: true },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    pricePerSeat: {
      type: Number,
      required: true,
      min: 0,
    },
    genderSafe: {
      type: Boolean,
      default: false,
    },
    passengers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["open", "full", "completed", "cancelled"],
      default: "open",
    },
    notes: {
      type: String,
      maxlength: 300,
      default: "",
    },

    // ─── F-14: Route Deviation Alert ────────────────────────────────
    // Stored when driver taps "Start Ride". Array of {lat, lng} points.
    plannedPolyline: {
      type: [
        {
          lat: { type: Number, required: true },
          lng: { type: Number, required: true },
        },
      ],
      default: [],
    },
    // True while driver is actively sharing location (trip in progress)
    tripActive: {
      type: Boolean,
      default: false,
    },
    // Timestamp when trip was started
    tripStartedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

carpoolRouteSchema.index({ "destination.area": 1, status: 1 });
carpoolRouteSchema.index({ departureTime: 1 });
carpoolRouteSchema.index({ driver: 1 });

const CarpoolRoute = mongoose.model("CarpoolRoute", carpoolRouteSchema);
export default CarpoolRoute;