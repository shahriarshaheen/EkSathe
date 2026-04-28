import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Coupon title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Discount type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value must be positive"],
    },
    // For percentage coupons — cap the max discount amount
    maxDiscountAmount: {
      type: Number,
      default: null, // null = no cap
    },
    // Minimum booking amount required to apply coupon
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    // Total times this coupon can be used across all users
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    // How many times a single user can use this coupon
    perUserLimit: {
      type: Number,
      default: 1,
    },
    // Which service type this applies to
    applicableFor: {
      type: String,
      enum: ["parking", "carpool", "all"],
      default: "all",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
      required: [true, "Valid from date is required"],
    },
    validUntil: {
      type: Date,
      required: [true, "Valid until date is required"],
    },
    // Which admin created this coupon
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Tracks per-user usage: [{ userId, count }]
    userUsage: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        count: { type: Number, default: 0 },
      },
    ],
    // Flag welcome coupons so they can be identified
    isWelcomeCoupon: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
