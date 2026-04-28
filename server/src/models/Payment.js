import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    // "parking" or "carpool"
    contextType: {
      type: String,
      enum: ["parking", "carpool"],
      default: "parking",
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    carpoolRouteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarpoolRoute",
      default: null,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Coupon tracking fields — null/0 when no coupon applied
    couponCode: { type: String, default: null },
    originalAmount: { type: Number, default: null }, // price before discount
    discountAmount: { type: Number, default: 0 },
    couponUsageMarked: {
      type: Boolean,
      default: false,
    },

    // This is the final charged amount (after discount)
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
