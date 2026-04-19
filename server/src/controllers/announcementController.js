import Announcement from "../models/Announcement.js";
import Booking from "../models/Booking.js";
import ParkingSpot from "../models/ParkingSpot.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const MAX_ANNOUNCEMENTS_PER_SPOT = 3;

const getTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

const CATEGORY_STYLES = {
  info:    { emoji: "ℹ️",  label: "Info",    color: "#0ea5e9", bg: "#f0f9ff", border: "#bae6fd" },
  warning: { emoji: "⚠️",  label: "Warning", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  urgent:  { emoji: "🚨", label: "Urgent",  color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

function buildAnnouncementEmail(student, homeownerName, spot, announcement) {
  const style = CATEGORY_STYLES[announcement.category];
  return {
    from: `"EkSathe Parking" <${process.env.EMAIL_USER}>`,
    to: student.email,
    subject: `${style.emoji} Spot Update: ${spot.title}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#111827;padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td><span style="color:#0d9488;font-size:18px;font-weight:700;">EkSathe</span></td>
              <td align="right"><span style="background:${style.color};color:#fff;font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;">${style.label.toUpperCase()}</span></td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td style="background:${style.bg};border-left:4px solid ${style.color};padding:20px 32px;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">${style.emoji} New Announcement for Your Spot</p>
            <p style="margin:6px 0 0;font-size:13px;color:#6b7280;">${spot.title} · ${spot.address}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 16px;font-size:15px;color:#374151;">Hi <strong>${student.name}</strong>,</p>
            <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
              <strong>${homeownerName}</strong>, the owner of your parking spot, has posted a new announcement:
            </p>
            <div style="background:${style.bg};border:1px solid ${style.border};border-radius:10px;padding:18px 20px;margin-bottom:24px;">
              <p style="margin:0;font-size:15px;color:#111827;line-height:1.6;">"${announcement.message}"</p>
            </div>
            <p style="margin:0;font-size:13px;color:#9ca3af;">
              This notice applies to your booking at <strong>${spot.address}</strong>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;">
            <p style="margin:0;font-size:12px;color:#6b7280;">Sent by <strong>EkSathe Parking</strong> · Dhaka, Bangladesh</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  };
}

export const createAnnouncement = async (req, res) => {
  try {
    const { spotId } = req.params;
    const { message, category } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const spot = await ParkingSpot.findById(spotId);
    if (!spot) return res.status(404).json({ success: false, message: "Spot not found." });
    if (spot.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "You do not own this spot." });

    const activeCount = await Announcement.countDocuments({ spotId, expiresAt: { $gt: new Date() } });
    if (activeCount >= MAX_ANNOUNCEMENTS_PER_SPOT) {
      return res.status(400).json({
        success: false,
        message: `Max ${MAX_ANNOUNCEMENTS_PER_SPOT} active announcements allowed. Delete one first.`,
      });
    }

    const announcement = await Announcement.create({
      spotId,
      homeownerId: req.user.id,
      message: message.trim(),
      category: category || "info",
    });

    // Email all unique students who ever booked this spot
    const bookings = await Booking.find({ spotId }).populate("studentId", "name email");
    const seen = new Set();
    const uniqueStudents = [];
    for (const b of bookings) {
      if (b.studentId && !seen.has(b.studentId._id.toString())) {
        seen.add(b.studentId._id.toString());
        uniqueStudents.push(b.studentId);
      }
    }
    if (uniqueStudents.length > 0) {
      const homeowner = await User.findById(req.user.id).select("name");
      const transporter = getTransporter();
      Promise.allSettled(
        uniqueStudents.map((s) =>
          transporter.sendMail(buildAnnouncementEmail(s, homeowner.name, spot, announcement))
        )
      ).catch((e) => console.error("Announcement email error:", e));
    }

    return res.status(201).json({ success: true, message: "Announcement posted.", announcement, notified: uniqueStudents.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const { spotId } = req.params;
    const userId = req.user?.id;
    const announcements = await Announcement.find({ spotId, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    const isHomeowner = announcements[0]?.homeownerId?.toString() === userId;
    const filtered = isHomeowner
      ? announcements
      : announcements.filter((a) => !a.dismissedBy.map((d) => d.toString()).includes(userId));
    return res.status(200).json({ success: true, announcements: filtered });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getHomeownerAnnouncements = async (req, res) => {
  try {
    const spots = await ParkingSpot.find({ owner: req.user.id }).select("_id title");
    const spotIds = spots.map((s) => s._id);
    const announcements = await Announcement.find({ spotId: { $in: spotIds }, expiresAt: { $gt: new Date() } })
      .populate("spotId", "title address")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, announcements });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found." });
    if (announcement.homeownerId.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized." });
    await announcement.deleteOne();
    return res.status(200).json({ success: true, message: "Announcement deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const dismissAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ success: false, message: "Announcement not found." });
    if (!announcement.dismissedBy.map((d) => d.toString()).includes(req.user.id)) {
      announcement.dismissedBy.push(req.user.id);
      await announcement.save();
    }
    return res.status(200).json({ success: true, message: "Dismissed." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};