import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    area: { type: String, required: true },
    lat:  { type: Number, required: true },
    lng:  { type: Number, required: true },
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
    origin:        { type: locationSchema, required: true },
    destination:   { type: locationSchema, required: true },
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

    // ─── F-14: Route Deviation Alert ─────────────────────────────────
    plannedPolyline: {
      type: [
        {
          lat: { type: Number, required: true },
          lng: { type: Number, required: true },
        },
      ],
      default: [],
    },
    tripActive: {
      type: Boolean,
      default: false,
    },
    tripStartedAt: {
      type: Date,
      default: null,
    },

    // ─── F-18: Check-In ───────────────────────────────────────────────
    // Each entry records a passenger who tapped "I've Arrived"
    checkins: {
  type: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      checkedInAt: {
        type: Date,
        default: Date.now,
      },

      // ─── Passenger Reward Coins ────────────────────────────────
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
      distanceFromPickupMeters: {
        type: Number,
        default: null,
      },
      coinsEarned: {
        type: Number,
        default: 0,
        min: 0,
      },
      coinTransactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CoinTransaction",
        default: null,
      },
      rewardReason: {
        type: String,
        default: null,
      },
    },
  ],
  default: [],
},
  },
  { timestamps: true }
);

carpoolRouteSchema.index({ "destination.area": 1, status: 1 });
carpoolRouteSchema.index({ departureTime: 1 });
carpoolRouteSchema.index({ driver: 1 });

const CarpoolRoute = mongoose.model("CarpoolRoute", carpoolRouteSchema);
export default CarpoolRoute;