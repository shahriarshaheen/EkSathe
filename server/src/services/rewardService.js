import mongoose from "mongoose";
import User from "../models/User.js";
import CoinTransaction from "../models/CoinTransaction.js";

const REWARD_TIERS = [
  {
    id: "COINS_50",
    coinsRequired: 50,
    discountAmount: 10,
  },
  {
    id: "COINS_100",
    coinsRequired: 100,
    discountAmount: 25,
  },
  {
    id: "COINS_200",
    coinsRequired: 200,
    discountAmount: 60,
  },
];

const PICKUP_RADIUS_METERS = 150;
const RESERVATION_EXPIRY_MINUTES = 30;

export const getRewardTiers = () => REWARD_TIERS;

export const calculateCoinsForCheckin = ({ checkedInAt, departureTime }) => {
  const diffMs = new Date(departureTime) - new Date(checkedInAt);
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes >= 10 && diffMinutes <= 15) return 15;
  if (diffMinutes >= 5 && diffMinutes < 10) return 10;
  if (diffMinutes >= 0 && diffMinutes < 5) return 5;

  return 0;
};

export const calculateDistanceMeters = (origin, checkinLocation) => {
  if (!origin || !checkinLocation) return null;

  const originLat = Number(origin.lat);
  const originLng = Number(origin.lng);
  const checkinLat = Number(checkinLocation.lat);
  const checkinLng = Number(checkinLocation.lng);

  if (
    !Number.isFinite(originLat) ||
    !Number.isFinite(originLng) ||
    !Number.isFinite(checkinLat) ||
    !Number.isFinite(checkinLng)
  ) {
    return null;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusMeters = 6371000;

  const dLat = toRad(checkinLat - originLat);
  const dLng = toRad(checkinLng - originLng);

  const lat1 = toRad(originLat);
  const lat2 = toRad(checkinLat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
};

const getRideOriginLocation = (ride) => {
  if (!ride?.origin) return null;

  if (
    Number.isFinite(Number(ride.origin.lat)) &&
    Number.isFinite(Number(ride.origin.lng))
  ) {
    return {
      lat: Number(ride.origin.lat),
      lng: Number(ride.origin.lng),
    };
  }

  if (
    Array.isArray(ride.origin.coordinates) &&
    ride.origin.coordinates.length >= 2
  ) {
    return {
      lng: Number(ride.origin.coordinates[0]),
      lat: Number(ride.origin.coordinates[1]),
    };
  }

  if (
    ride.origin.location &&
    Array.isArray(ride.origin.location.coordinates) &&
    ride.origin.location.coordinates.length >= 2
  ) {
    return {
      lng: Number(ride.origin.location.coordinates[0]),
      lat: Number(ride.origin.location.coordinates[1]),
    };
  }

  return null;
};

export const awardCheckinCoins = async ({
  userId,
  ride,
  checkinLocation,
  checkedInAt,
}) => {
  const sourceId = `${ride._id.toString()}_${userId.toString()}`;

  const existingTransaction = await CoinTransaction.findOne({
    userId,
    type: "earn",
    sourceType: "checkin",
    sourceId,
  });

  if (existingTransaction) {
    return {
      coinsEarned: 0,
      coinBalance: null,
      reason: "Already rewarded",
      transactionId: existingTransaction._id,
      distance: null,
    };
  }



  if (!checkinLocation) {
    return {
      coinsEarned: 0,
      coinBalance: null,
      reason: "Location not verified",
      transactionId: null,
      distance: null,
    };
  }

  const origin = getRideOriginLocation(ride);
  const distance = calculateDistanceMeters(origin, checkinLocation);

  if (distance === null) {
    return {
      coinsEarned: 0,
      coinBalance: null,
      reason: "Pickup location not available",
      transactionId: null,
      distance: null,
    };
  }

  if (distance > PICKUP_RADIUS_METERS) {
    return {
      coinsEarned: 0,
      coinBalance: null,
      reason: "Outside pickup area",
      transactionId: null,
      distance,
    };
  }

  const coins = calculateCoinsForCheckin({
    checkedInAt,
    departureTime: ride.departureTime,
  });

  if (coins <= 0) {
    return {
      coinsEarned: 0,
      coinBalance: null,
      reason: "Not within reward window",
      transactionId: null,
      distance,
    };
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const transaction = await CoinTransaction.create(
      [
        {
          userId,
          type: "earn",
          status: "completed",
          coins,
          sourceType: "checkin",
          sourceId,
          rideId: ride._id,
          metadata: {
            checkedInAt,
            distanceFromPickupMeters: distance,
          },
        },
      ],
      { session },
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: {
          coinBalance: coins,
          lifetimeCoinsEarned: coins,
        },
      },
      {
        new: true,
        session,
      },
    ).select("coinBalance");

    await session.commitTransaction();

    return {
      coinsEarned: coins,
      coinBalance: updatedUser?.coinBalance ?? null,
      reason: null,
      transactionId: transaction[0]._id,
      distance,
    };
  } catch (error) {
    await session.abortTransaction();

    if (error.code === 11000) {
      return {
        coinsEarned: 0,
        coinBalance: null,
        reason: "Already rewarded",
        transactionId: null,
        distance,
      };
    }

    console.error("awardCheckinCoins error:", error);

    return {
      coinsEarned: 0,
      coinBalance: null,
      reason: "Reward error",
      transactionId: null,
      distance,
    };
  } finally {
    session.endSession();
  }
};

export const getUserRewardSummary = async (userId) => {
  const user = await User.findById(userId).select(
    "coinBalance lifetimeCoinsEarned lifetimeCoinsRedeemed",
  );

  const recentTransactions = await CoinTransaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    coinBalance: user?.coinBalance || 0,
    lifetimeCoinsEarned: user?.lifetimeCoinsEarned || 0,
    lifetimeCoinsRedeemed: user?.lifetimeCoinsRedeemed || 0,
    tiers: REWARD_TIERS,
    recentTransactions,
  };
};

export const getEligibleRedemptionTiers = async ({ userId, amount }) => {
  const user = await User.findById(userId).select("coinBalance");

  const coinBalance = user?.coinBalance || 0;
  const numericAmount = Math.max(0, Number(amount) || 0);

  const tiers = REWARD_TIERS.map((tier) => {
    const hasEnoughCoins = coinBalance >= tier.coinsRequired;
    const discountAmount = Math.min(tier.discountAmount, numericAmount);

    return {
      ...tier,
      discountAmount,
      finalAmount: Math.max(0, numericAmount - discountAmount),
      canRedeem: hasEnoughCoins && numericAmount > 0,
      reason: hasEnoughCoins
        ? numericAmount > 0
          ? null
          : "Invalid amount"
        : `Need ${tier.coinsRequired - coinBalance} more coins`,
    };
  });

  return {
    coinBalance,
    amount: numericAmount,
    tiers,
  };
};

export const reserveCoinsForPayment = async ({
  userId,
  paymentId,
  routeId,
  tierId,
  amount,
}) => {
  const tier = REWARD_TIERS.find((item) => item.id === tierId);

  if (!tier) {
    throw new Error("Invalid reward tier");
  }

  const numericAmount = Math.max(0, Number(amount) || 0);
  const discountAmount = Math.min(tier.discountAmount, numericAmount);

  const updatedUser = await User.findOneAndUpdate(
    {
      _id: userId,
      coinBalance: { $gte: tier.coinsRequired },
    },
    {
      $inc: {
        coinBalance: -tier.coinsRequired,
      },
    },
    {
      new: true,
    },
  ).select("coinBalance");

  if (!updatedUser) {
    throw new Error("Insufficient coins");
  }

  try {
    const transaction = await CoinTransaction.create({
      userId,
      type: "redeem",
      status: "reserved",
      coins: -tier.coinsRequired,
      discountAmount,
      sourceType: "payment",
      sourceId: paymentId.toString(),
      rideId: routeId || null,
      paymentId,
      expiresAt: new Date(Date.now() + RESERVATION_EXPIRY_MINUTES * 60 * 1000),
    });

    return {
      transaction,
      tier: {
        ...tier,
        discountAmount,
      },
      coinBalance: updatedUser.coinBalance,
    };
  } catch (error) {
    await User.findByIdAndUpdate(userId, {
      $inc: {
        coinBalance: tier.coinsRequired,
      },
    });

    throw error;
  }
};

export const completeCoinReservation = async (payment) => {
  if (!payment?.coinTransactionId) return;

  const transaction = await CoinTransaction.findById(payment.coinTransactionId);

  if (!transaction || transaction.status === "completed") return;

  if (transaction.status !== "reserved") return;

  transaction.status = "completed";
  transaction.expiresAt = null;
  await transaction.save();

  await User.findByIdAndUpdate(payment.studentId, {
    $inc: {
      lifetimeCoinsRedeemed: Math.abs(transaction.coins),
    },
  });
};

export const releaseCoinReservation = async (payment, reason = "Payment not completed") => {
  if (!payment?.coinTransactionId) return;

  const transaction = await CoinTransaction.findById(payment.coinTransactionId);

  if (!transaction || transaction.status !== "reserved") return;

  transaction.status = "released";
  transaction.metadata = {
    ...(transaction.metadata || {}),
    releaseReason: reason,
  };
  transaction.expiresAt = null;

  await transaction.save();

  await User.findByIdAndUpdate(payment.studentId, {
    $inc: {
      coinBalance: Math.abs(transaction.coins),
    },
  });
};

export const releaseExpiredCoinReservations = async () => {
  const expiredTransactions = await CoinTransaction.find({
    status: "reserved",
    expiresAt: {
      $lte: new Date(),
    },
  }).limit(50);

  for (const transaction of expiredTransactions) {
    transaction.status = "released";
    transaction.metadata = {
      ...(transaction.metadata || {}),
      releaseReason: "Reservation expired",
    };
    transaction.expiresAt = null;

    await transaction.save();

    await User.findByIdAndUpdate(transaction.userId, {
      $inc: {
        coinBalance: Math.abs(transaction.coins),
      },
    });
  }
};