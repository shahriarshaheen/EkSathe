import { validationResult } from "express-validator";
import Incident from "../models/Incident.js";

export const submitIncident = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  try {
    const { category, description, location, coordinates } = req.body;

    const incident = await Incident.create({
      category,
      description,
      location: location || null,
      coordinates: {
        lat: coordinates?.lat ?? null,
        lng: coordinates?.lng ?? null,
      },
      reporterUserId: req.user.id,
    });

    const safe = incident.toObject();
    delete safe.reporterUserId;

    return res.status(201).json({ success: true, data: safe });
  } catch (err) {
    console.error("submitIncident error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find()
      .select("-reporterUserId")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: incidents });
  } catch (err) {
    console.error("getAllIncidents error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateIncidentStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).select("-reporterUserId");

    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    return res.status(200).json({ success: true, data: incident });
  } catch (err) {
    console.error("updateIncidentStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};