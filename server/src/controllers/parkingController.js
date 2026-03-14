import { v2 as cloudinary } from "cloudinary";
import ParkingSpot from "../models/ParkingSpot.js";

// ── CREATE SPOT ──────────────────────────────────────────────
export const createSpot = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      latitude,
      longitude,
      pricePerDay,
      availableFrom,
      availableTo,
      availableDays,
      spotType,
    } = req.body;

    // Build photos array from uploaded files
    const photos = (req.files || []).map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    const spot = await ParkingSpot.create({
      owner: req.user.id,
      title,
      description,
      address,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      photos,
      pricePerDay: parseFloat(pricePerDay),
      availableFrom,
      availableTo,
      availableDays: availableDays
        ? JSON.parse(availableDays)
        : ["monday", "tuesday", "wednesday", "thursday", "friday"],
      spotType: spotType || "open",
    });

    return res.status(201).json({
      success: true,
      message: "Parking spot listed successfully.",
      spot,
    });
  } catch (err) {
    console.error("createSpot error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── GET ALL SPOTS (with optional geo filter) ─────────────────
export const getSpots = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius = 5000,
      page = 1,
      limit = 12,
    } = req.query;

    let query = { isActive: true };
    let spots;

    if (latitude && longitude) {
      // Geo query — find spots within radius (meters)
      spots = await ParkingSpot.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: parseInt(radius),
          },
        },
      })
        .populate("owner", "name email trustScore")
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    } else {
      // No geo filter — return all active spots
      spots = await ParkingSpot.find(query)
        .populate("owner", "name email trustScore")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    }

    const total = await ParkingSpot.countDocuments(query);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      spots,
    });
  } catch (err) {
    console.error("getSpots error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── GET SINGLE SPOT ──────────────────────────────────────────
export const getSpotById = async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id).populate(
      "owner",
      "name email trustScore photoUrl",
    );

    if (!spot) {
      return res
        .status(404)
        .json({ success: false, message: "Spot not found." });
    }

    return res.status(200).json({ success: true, spot });
  } catch (err) {
    if (err.name === "CastError") {
      return res
        .status(404)
        .json({ success: false, message: "Spot not found." });
    }
    console.error("getSpotById error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── GET MY SPOTS (homeowner's own listings) ──────────────────
export const getMySpots = async (req, res) => {
  try {
    const spots = await ParkingSpot.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ success: true, spots });
  } catch (err) {
    console.error("getMySpots error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── UPDATE SPOT ──────────────────────────────────────────────
export const updateSpot = async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
      return res
        .status(404)
        .json({ success: false, message: "Spot not found." });
    }

    // Only the owner can update
    if (spot.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    const {
      title,
      description,
      address,
      latitude,
      longitude,
      pricePerDay,
      availableFrom,
      availableTo,
      availableDays,
      spotType,
      isActive,
    } = req.body;

    if (title) spot.title = title;
    if (description !== undefined) spot.description = description;
    if (address) spot.address = address;
    if (latitude && longitude) {
      spot.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }
    if (pricePerDay) spot.pricePerDay = parseFloat(pricePerDay);
    if (availableFrom) spot.availableFrom = availableFrom;
    if (availableTo) spot.availableTo = availableTo;
    if (availableDays) spot.availableDays = JSON.parse(availableDays);
    if (spotType) spot.spotType = spotType;
    if (isActive !== undefined) spot.isActive = isActive;

    // Handle new photos if uploaded
    if (req.files && req.files.length > 0) {
      // Delete old photos from Cloudinary
      for (const photo of spot.photos) {
        await cloudinary.uploader.destroy(photo.publicId);
      }
      spot.photos = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    }

    await spot.save();

    return res.status(200).json({
      success: true,
      message: "Spot updated successfully.",
      spot,
    });
  } catch (err) {
    console.error("updateSpot error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── DELETE SPOT ──────────────────────────────────────────────
export const deleteSpot = async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);

    if (!spot) {
      return res
        .status(404)
        .json({ success: false, message: "Spot not found." });
    }

    // Only the owner can delete
    if (spot.owner.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });
    }

    // Delete photos from Cloudinary
    for (const photo of spot.photos) {
      await cloudinary.uploader.destroy(photo.publicId);
    }

    await spot.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Spot deleted successfully.",
    });
  } catch (err) {
    console.error("deleteSpot error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
