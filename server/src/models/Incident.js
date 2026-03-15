import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: {
        values: ["harassment", "unsafe_driving", "theft", "suspicious_activity", "other"],
        message: "Invalid category",
      },
      required: [true, "Category is required"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [20, "Description must be at least 20 characters"],
      trim: true,
    },

    location: {
      type: String,
      trim: true,
      default: null,
    },

    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    reporterUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      select: false,
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "reviewed", "resolved"],
        message: "Invalid status",
      },
      default: "pending",
    },
  },
  { timestamps: true }
);

const Incident = mongoose.model("Incident", incidentSchema);
export default Incident;