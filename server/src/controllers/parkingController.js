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
      spotType,
    } = req.body;

    // availableDays comes as availableDays[] from FormData
    const availableDays = req.body["availableDays[]"]
      ? Array.isArray(req.body["availableDays[]"])
        ? req.body["availableDays[]"]
        : [req.body["availableDays[]"]]
      : ["monday", "tuesday", "wednesday", "thursday", "friday"];

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
      availableDays,
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

// ── GET ALL SPOTS (F-19: Advanced Search & Filter) ───────────
export const getSpots = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      radius = 5000,
      page = 1,
      limit = 12,
      // F-19 new params
      search,
      priceMin,
      priceMax,
      availableDay,
      availableFrom,
      availableTo,
    } = req.query;

    // ── Build dynamic filter ──────────────────────────────────

    const filter = { isActive: true };

    // Text search on title and address
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ title: regex }, { address: regex }];
    }

    // Price range — model field is pricePerDay
    if (priceMin !== undefined && priceMin !== "") {
      filter.pricePerDay = { ...filter.pricePerDay, $gte: parseFloat(priceMin) };
    }
    if (priceMax !== undefined && priceMax !== "") {
      filter.pricePerDay = { ...filter.pricePerDay, $lte: parseFloat(priceMax) };
    }

    // Available day — model stores availableDays as a flat string array
    // e.g. ["monday", "tuesday", "friday"]
    if (availableDay && availableDay.trim()) {
      filter.availableDays = availableDay.toLowerCase().trim();
    }

    // Time window — model has top-level availableFrom / availableTo strings (HH:MM)
    // We filter spots whose window contains the requested window
    if (availableFrom && availableFrom.trim()) {
      // spot must open at or before requested start
      filter.availableFrom = { $lte: availableFrom.trim() };
    }
    if (availableTo && availableTo.trim()) {
      // spot must close at or after requested end
      filter.availableTo = { $gte: availableTo.trim() };
    }

    // ── Geo or plain query ────────────────────────────────────

    let spots;

    if (latitude && longitude) {
      spots = await ParkingSpot.find({
        ...filter,
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
      spots = await ParkingSpot.find(filter)
        .populate("owner", "name email trustScore")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
    }

    const total = await ParkingSpot.countDocuments(filter);

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
    if (!spot)
      return res
        .status(404)
        .json({ success: false, message: "Spot not found." });
    return res.status(200).json({ success: true, spot });
  } catch (err) {
    if (err.name === "CastError")
      return res
        .status(404)
        .json({ success: false, message: "Spot not found." });
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── GET MY SPOTS ─────────────────────────────────────────────
export const getMySpots = async (req, res) => {
  try {
    const spots = await ParkingSpot.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, spots });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── UPDATE SPOT ──────────────────────────────────────────────
export const updateSpot = async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);
    if (!spot)
      return res
        .status(404)
        .json({ success: false, message: "Spot not found." });
    if (spot.owner.toString() !== req.user.id)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });

    const {
      title,
      description,
      address,
      latitude,
      longitude,
      pricePerDay,
      availableFrom,
      availableTo,
      spotType,
      isActive,
    } = req.body;

    if (title) spot.title = title;
    if (description !== undefined) spot.description = description;
    if (address) spot.address = address;
    if (latitude && longitude)
      spot.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    if (pricePerDay) spot.pricePerDay = parseFloat(pricePerDay);
    if (availableFrom) spot.availableFrom = availableFrom;
    if (availableTo) spot.availableTo = availableTo;
    if (isActive !== undefined)
      spot.isActive = isActive === "true" || isActive === true;

    const availableDays = req.body["availableDays[]"];
    if (availableDays) {
      spot.availableDays = Array.isArray(availableDays)
        ? availableDays
        : [availableDays];
    }

    if (req.files && req.files.length > 0) {
      for (const photo of spot.photos)
        await cloudinary.uploader.destroy(photo.publicId);
      spot.photos = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }));
    }

    await spot.save();
    return res
      .status(200)
      .json({ success: true, message: "Spot updated successfully.", spot });
  } catch (err) {
    console.error("updateSpot error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── DELETE SPOT ──────────────────────────────────────────────
export const deleteSpot = async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id);
    if (!spot)
      return res
        .status(404)
        .json({ success: false, message: "Spot not found." });
    if (spot.owner.toString() !== req.user.id)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });

    for (const photo of spot.photos)
      await cloudinary.uploader.destroy(photo.publicId);
    await spot.deleteOne();

    return res
      .status(200)
      .json({ success: true, message: "Spot deleted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};