import mongoose from "mongoose";

const coinTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["earn", "redeem", "refund", "adjust"],
      required: true,
    },

    status: {
      type: String,
      enum: ["completed", "reserved", "released", "voided"],
      default: "completed",
    },

    coins: {
      type: Number,
      required: true,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    sourceType: {
      type: String,
      enum: ["checkin", "payment", "admin", "system"],
      required: true,
    },

    sourceId: {
      type: String,
      required: true,
    },

    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarpoolRoute",
      default: null,
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

coinTransactionSchema.index({ userId: 1, createdAt: -1 });
coinTransactionSchema.index({ status: 1, expiresAt: 1 });

coinTransactionSchema.index(
  {
    userId: 1,
    type: 1,
    sourceType: 1,
    sourceId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      type: "earn",
      sourceType: "checkin",
    },
  },
);

const CoinTransaction = mongoose.model(
  "CoinTransaction",
  coinTransactionSchema,
);

export default CoinTransaction;