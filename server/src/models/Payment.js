import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // "parking" or "carpool"
    contextType: {
      type: String,
      enum: ["parking", "carpool"],
      default: "parking",
    },

    // Parking: reference to Booking
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    // Carpool: reference to CarpoolRoute
    carpoolRouteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarpoolRoute",
      default: null,
    },

    // Who is paying
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    tranId: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["initiated", "paid", "failed", "cancelled"],
      default: "initiated",
    },

    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
