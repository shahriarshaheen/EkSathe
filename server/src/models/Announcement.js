import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    spotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingSpot",
      required: true,
      index: true,
    },
    homeownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [200, "Message cannot exceed 200 characters"],
    },
    // info = blue, warning = amber, urgent = red
    category: {
      type: String,
      enum: ["info", "warning", "urgent"],
      default: "info",
    },
    // Students who have dismissed this announcement
    dismissedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Auto-expire after 30 days
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);