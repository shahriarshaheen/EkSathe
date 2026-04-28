import Coupon from "../models/Coupon.js";

const VALID_SERVICE_TYPES = ["parking", "carpool", "all"];
const VALID_DISCOUNT_TYPES = ["percentage", "fixed"];

const isBlank = (value) =>
  value === undefined || value === null || value === "";

const parseOptionalNumber = (value) => {
  if (isBlank(value)) return null;
  return Number(value);
};

const validateCouponFields = (coupon) => {
  const discountValue = Number(coupon.discountValue);
  const maxDiscountAmount = parseOptionalNumber(coupon.maxDiscountAmount);
  const minOrderAmount = Number(coupon.minOrderAmount || 0);
  const usageLimit = parseOptionalNumber(coupon.usageLimit);
  const perUserLimit = Number(coupon.perUserLimit || 1);
  const validFrom = new Date(coupon.validFrom);
  const validUntil = new Date(coupon.validUntil);

  if (!coupon.code?.trim() || !coupon.title?.trim()) {
    return "Coupon code and title are required.";
  }

  if (!VALID_DISCOUNT_TYPES.includes(coupon.discountType)) {
    return "Invalid discount type.";
  }

  if (!VALID_SERVICE_TYPES.includes(coupon.applicableFor || "all")) {
    return "Invalid coupon service type.";
  }

  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return "Discount value must be greater than 0.";
  }

  if (coupon.discountType === "percentage" && discountValue > 100) {
    return "Percentage discount cannot be more than 100%.";
  }

  if (
    maxDiscountAmount !== null &&
    (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount <= 0)
  ) {
    return "Max discount amount must be greater than 0.";
  }

  if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
    return "Minimum order amount cannot be negative.";
  }

  if (
    usageLimit !== null &&
    (!Number.isInteger(usageLimit) || usageLimit <= 0)
  ) {
    return "Usage limit must be a positive whole number.";
  }

  if (!Number.isInteger(perUserLimit) || perUserLimit <= 0) {
    return "Per user limit must be a positive whole number.";
  }

  if (Number.isNaN(validFrom.getTime()) || Number.isNaN(validUntil.getTime())) {
    return "Valid date range is required.";
  }

  if (validUntil <= validFrom) {
    return "Valid until must be after valid from.";
  }

  return null;
};

const calculateDiscount = (coupon, amount) => {
  let discountAmount = 0;

  if (coupon.discountType === "percentage") {
    discountAmount = Math.round((amount * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount !== undefined) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    discountAmount = Math.min(coupon.discountValue, amount);
  }

  return {
    discountAmount,
    finalAmount: Math.max(0, amount - discountAmount),
  };
};

const getUserUsedCount = (coupon, userId) => {
  const userEntry = coupon.userUsage.find(
    (u) => u.userId.toString() === userId.toString(),
  );
  return userEntry ? userEntry.count : 0;
};

const shapeCouponForUser = (coupon, amount, userId) => {
  const userUsedCount = getUserUsedCount(coupon, userId);
  const usageReached =
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    coupon.usedCount >= coupon.usageLimit;
  const userLimitReached = userUsedCount >= (coupon.perUserLimit || 1);
  const minAmountMissing = amount < coupon.minOrderAmount;
  const { discountAmount, finalAmount } = calculateDiscount(coupon, amount);

  let reason = null;
  if (usageReached) reason = "Usage limit reached";
  else if (userLimitReached) reason = "Already used";
  else if (minAmountMissing)
    reason = `Minimum booking amount ৳${coupon.minOrderAmount}`;

  return {
    code: coupon.code,
    title: coupon.title,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maxDiscountAmount: coupon.maxDiscountAmount,
    minOrderAmount: coupon.minOrderAmount,
    applicableFor: coupon.applicableFor,
    validUntil: coupon.validUntil,
    usageLimit: coupon.usageLimit,
    usedCount: coupon.usedCount,
    perUserLimit: coupon.perUserLimit,
    userUsedCount,
    canApply: !usageReached && !userLimitReached && !minAmountMissing,
    reason,
    discountAmount,
    finalAmount,
  };
};

// ── Shared validation helper — used by validate endpoint AND payment ──
// Returns { valid, message, coupon?, discountAmount?, finalAmount? }
export const validateCouponLogic = async (
  code,
  serviceType,
  amount,
  userId,
) => {
  const normalizedCode = code?.toUpperCase().trim();
  if (!normalizedCode)
    return { valid: false, message: "Coupon code is required." };

  if (!VALID_SERVICE_TYPES.includes(serviceType)) {
    return { valid: false, message: "Invalid coupon service type." };
  }

  amount = Number(amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { valid: false, message: "A valid booking amount is required." };
  }

  const coupon = await Coupon.findOne({ code: normalizedCode });

  if (!coupon) return { valid: false, message: "This coupon code is invalid." };
  if (!coupon.isActive)
    return { valid: false, message: "This coupon is no longer active." };

  const now = new Date();
  if (now < new Date(coupon.validFrom))
    return { valid: false, message: "This coupon is not yet valid." };
  if (now > new Date(coupon.validUntil))
    return { valid: false, message: "This coupon has expired." };

  if (coupon.applicableFor !== "all" && coupon.applicableFor !== serviceType) {
    return {
      valid: false,
      message: `This coupon is only valid for ${coupon.applicableFor} bookings.`,
    };
  }

  if (amount < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum booking amount of ৳${coupon.minOrderAmount} required for this coupon.`,
    };
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    return {
      valid: false,
      message: "This coupon has reached its usage limit.",
    };
  }

  const userUsedCount = getUserUsedCount(coupon, userId);
  if (userUsedCount >= (coupon.perUserLimit || 1)) {
    return { valid: false, message: "You have already used this coupon." };
  }

  // Calculate discount on backend — never trust frontend
  const { discountAmount, finalAmount } = calculateDiscount(coupon, amount);

  return {
    valid: true,
    coupon,
    discountAmount,
    finalAmount,
    message:
      coupon.discountType === "percentage"
        ? `Coupon applied! You saved ${coupon.discountValue}% (৳${discountAmount})`
        : `Coupon applied! You saved ৳${discountAmount}`,
  };
};

// ── Mark coupon as used — called ONLY after confirmed payment ──
export const markCouponUsed = async (couponCode, userId) => {
  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
  if (!coupon) return;

  coupon.usedCount += 1;
  const userEntry = coupon.userUsage.find(
    (u) => u.userId.toString() === userId.toString(),
  );
  if (userEntry) {
    userEntry.count += 1;
  } else {
    coupon.userUsage.push({ userId, count: 1 });
  }
  await coupon.save();
};

// ── STUDENT ENDPOINT ──────────────────────────────────────────
// GET /api/coupons/available?serviceType=parking&amount=120
export const getAvailableCoupons = async (req, res) => {
  try {
    const { serviceType = "all", amount = 0 } = req.query;
    const bookingAmount = Number(amount);

    if (!VALID_SERVICE_TYPES.includes(serviceType)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid coupon service type." });
    }

    if (!Number.isFinite(bookingAmount) || bookingAmount < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid booking amount." });
    }

    const now = new Date();
    const filter = {
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
    };

    if (serviceType !== "all") {
      filter.$or = [{ applicableFor: "all" }, { applicableFor: serviceType }];
    }

    const coupons = await Coupon.find(filter).sort({
      validUntil: 1,
      createdAt: -1,
    });

    const shaped = coupons
      .map((coupon) => shapeCouponForUser(coupon, bookingAmount, req.user.id))
      .sort((a, b) => Number(b.canApply) - Number(a.canApply));

    return res.status(200).json({ success: true, data: shaped });
  } catch (err) {
    console.error("getAvailableCoupons error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// POST /api/coupons/validate
export const validateCoupon = async (req, res) => {
  try {
    const { couponCode, serviceType, amount } = req.body;

    if (!couponCode || !serviceType || !amount) {
      return res.status(400).json({
        success: false,
        message: "couponCode, serviceType, and amount are required.",
      });
    }

    const result = await validateCouponLogic(
      couponCode,
      serviceType,
      Number(amount),
      req.user.id,
    );

    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      discountAmount: result.discountAmount,
      finalAmount: result.finalAmount,
      coupon: {
        code: result.coupon.code,
        title: result.coupon.title,
        discountType: result.coupon.discountType,
        discountValue: result.coupon.discountValue,
      },
    });
  } catch (err) {
    console.error("validateCoupon error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── ADMIN CRUD ────────────────────────────────────────────────

// POST /api/admin/coupons
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      usageLimit,
      perUserLimit,
      applicableFor,
      isActive,
      validFrom,
      validUntil,
    } = req.body;

    if (
      !code ||
      !title ||
      !discountType ||
      isBlank(discountValue) ||
      !validFrom ||
      !validUntil
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    const couponData = {
      code: code.toUpperCase().trim(),
      title,
      description: description || "",
      discountType,
      discountValue: Number(discountValue),
      maxDiscountAmount:
        discountType === "percentage" ? parseOptionalNumber(maxDiscountAmount) : null,
      minOrderAmount: Number(minOrderAmount || 0),
      usageLimit: parseOptionalNumber(usageLimit),
      perUserLimit: Number(perUserLimit || 1),
      applicableFor: applicableFor || "all",
      isActive: isActive !== false,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      createdBy: req.user.id,
    };

    const validationError = validateCouponFields(couponData);
    if (validationError) {
      return res
        .status(400)
        .json({ success: false, message: validationError });
    }

    const existing = await Coupon.findOne({ code: couponData.code });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A coupon with this code already exists.",
      });
    }

    const coupon = await Coupon.create(couponData);

    return res.status(201).json({
      success: true,
      data: coupon,
      message: "Coupon created successfully.",
    });
  } catch (err) {
    console.error("createCoupon error:", err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code already exists." });
    }
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/admin/coupons
export const getAllCoupons = async (req, res) => {
  try {
    const { search, status, type } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
    }
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;
    if (status === "expired") filter.validUntil = { $lt: new Date() };
    if (type && type !== "all") filter.applicableFor = type;

    const coupons = await Coupon.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: coupons });
  } catch (err) {
    console.error("getAllCoupons error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/admin/coupons/:id
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id).populate(
      "createdBy",
      "name",
    );
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found." });
    return res.status(200).json({ success: true, data: coupon });
  } catch (err) {
    console.error("getCouponById error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// PUT /api/admin/coupons/:id
export const updateCoupon = async (req, res) => {
  try {
    const {
      title,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minOrderAmount,
      usageLimit,
      perUserLimit,
      applicableFor,
      isActive,
      validFrom,
      validUntil,
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found." });

    if (title !== undefined) coupon.title = title;
    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined)
      coupon.discountValue = Number(discountValue);
    if (maxDiscountAmount !== undefined)
      coupon.maxDiscountAmount = parseOptionalNumber(maxDiscountAmount);
    if (minOrderAmount !== undefined)
      coupon.minOrderAmount = Number(minOrderAmount);
    if (usageLimit !== undefined)
      coupon.usageLimit = parseOptionalNumber(usageLimit);
    if (perUserLimit !== undefined) coupon.perUserLimit = Number(perUserLimit);
    if (applicableFor !== undefined) coupon.applicableFor = applicableFor;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (validFrom !== undefined) coupon.validFrom = new Date(validFrom);
    if (validUntil !== undefined) coupon.validUntil = new Date(validUntil);

    if (coupon.discountType === "fixed") coupon.maxDiscountAmount = null;

    const validationError = validateCouponFields(coupon);
    if (validationError) {
      return res
        .status(400)
        .json({ success: false, message: validationError });
    }

    await coupon.save();
    return res.status(200).json({
      success: true,
      data: coupon,
      message: "Coupon updated successfully.",
    });
  } catch (err) {
    console.error("updateCoupon error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// PATCH /api/admin/coupons/:id/toggle
export const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found." });

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? "activated" : "deactivated"} successfully.`,
      isActive: coupon.isActive,
    });
  } catch (err) {
    console.error("toggleCoupon error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// DELETE /api/admin/coupons/:id
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found." });
    return res
      .status(200)
      .json({ success: true, message: "Coupon deleted successfully." });
  } catch (err) {
    console.error("deleteCoupon error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
