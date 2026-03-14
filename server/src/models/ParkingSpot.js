import mongoose from "mongoose";

const parkingSpotSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, "Coordinates are required"],
      },
    },

    photos: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],

    pricePerDay: {
      type: Number,
      required: [true, "Price per day is required"],
      min: [0, "Price cannot be negative"],
    },

    availableFrom: {
      type: String, // "08:00"
      required: [true, "Available from time is required"],
    },

    availableTo: {
      type: String, // "20:00"
      required: [true, "Available to time is required"],
    },

    availableDays: {
      type: [String],
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      default: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    },

    spotType: {
      type: String,
      enum: ["garage", "driveway", "open"],
      default: "open",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    totalBookings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Geospatial index for proximity queries
parkingSpotSchema.index({ location: "2dsphere" });

// Index for owner queries
parkingSpotSchema.index({ owner: 1 });

const ParkingSpot = mongoose.model("ParkingSpot", parkingSpotSchema);

export default ParkingSpot;
