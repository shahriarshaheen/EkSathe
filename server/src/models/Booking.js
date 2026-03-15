import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    spotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Spot",
      required: [true, "Spot ID is required"],
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
    },

    homeownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Homeowner ID is required"],
    },

    date: {
      type: String,
      required: [true, "Date is required"],
      // stored as YYYY-MM-DD string for simple conflict checking
    },

    startTime: {
      type: String,
      required: [true, "Start time is required"],
      // stored as HH:MM string e.g. "09:00"
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
      // stored as HH:MM string e.g. "11:00"
    },

    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: 0,
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "cancelled"],
        message: "Invalid booking status",
      },
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: {
        values: ["unpaid", "paid", "refunded"],
        message: "Invalid payment status",
      },
      default: "unpaid",
    },

    cancelledBy: {
      type: String,
      enum: ["student", "homeowner", "admin", null],
      default: null,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;