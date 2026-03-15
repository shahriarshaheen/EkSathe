import nodemailer from "nodemailer";
import EmergencyContact from "../models/EmergencyContact.js";
import User from "../models/User.js";

const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const buildSosEmail = (user, contact, latitude, longitude, mapsLink) => {
  const staticMapUrl = `https://static-maps.yandex.ru/1.x/?lang=en-US&ll=${longitude},${latitude}&z=15&l=map&size=600,300&pt=${longitude},${latitude},pm2rdl`;
  const timestamp = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return {
    from: `"EkSathe Safety" <${process.env.EMAIL_USER}>`,
    to: contact.email,
    subject: `⚠️ SOS Alert — ${user.name} needs help`,
    text: `SOS ALERT from EkSathe\n\n${user.name} has triggered an emergency SOS alert.\n\nTime: ${timestamp}\nLocation: ${mapsLink}\nCoordinates: ${latitude}, ${longitude}\n\nPlease contact ${user.name} immediately or call emergency services.\n\n— EkSathe Safety System\nhttps://eksathe.com`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0; padding:0; background:#f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#111827; padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#0d9488; border-radius:8px; width:32px; height:32px; text-align:center; vertical-align:middle;">
                          <span style="color:white; font-size:16px;">📍</span>
                        </td>
                        <td style="padding-left:10px;">
                          <span style="color:white; font-size:18px; font-weight:700; letter-spacing:-0.5px;">EkSathe</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right">
                    <span style="background:#ef4444; color:white; font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; letter-spacing:0.5px;">SAFETY ALERT</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alert banner -->
          <tr>
            <td style="background:#fef2f2; border-left:4px solid #ef4444; padding:20px 32px;">
              <p style="margin:0; font-size:22px; font-weight:700; color:#991b1b;">⚠️ Emergency SOS Alert</p>
              <p style="margin:6px 0 0; font-size:14px; color:#b91c1c;">${timestamp}</p>
            </td>
          </tr>

          <!-- Student info -->
          <tr>
            <td style="padding: 28px 32px 0;">
              <p style="margin:0 0 16px; font-size:15px; color:#374151;">
                Hi <strong>${contact.name}</strong>,
              </p>
              <p style="margin:0 0 20px; font-size:15px; color:#111827; line-height:1.6;">
                <strong>${user.name}</strong> has triggered an SOS emergency alert on EkSathe and may need immediate assistance. Please contact them or emergency services right away.
              </p>

              <!-- Student card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#0d9488; border-radius:50%; width:44px; height:44px; text-align:center; vertical-align:middle;">
                          <span style="color:white; font-size:18px; font-weight:700;">${user.name[0].toUpperCase()}</span>
                        </td>
                        <td style="padding-left:14px;">
                          <p style="margin:0; font-size:16px; font-weight:700; color:#111827;">${user.name}</p>
                          <p style="margin:3px 0 0; font-size:13px; color:#6b7280;">${user.email}</p>
                          <p style="margin:3px 0 0; font-size:12px; color:#0d9488; font-weight:600; text-transform:capitalize;">EkSathe ${user.role}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Map -->
          <tr>
            <td style="padding: 0 32px;">
              <p style="margin:0 0 12px; font-size:14px; font-weight:600; color:#374151; text-transform:uppercase; letter-spacing:0.5px;">Last Known Location</p>
              <a href="${mapsLink}" style="display:block; border-radius:10px; overflow:hidden; border:1px solid #e5e7eb;">
                <img src="${staticMapUrl}" alt="Location Map" width="536" style="display:block; width:100%; max-width:536px;" />
              </a>
              <p style="margin:8px 0 0; font-size:12px; color:#9ca3af;">📍 ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td style="padding: 24px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${mapsLink}"
                      style="display:inline-block; background:#ef4444; color:white; font-size:15px; font-weight:700; padding:14px 32px; border-radius:8px; text-decoration:none; letter-spacing:0.2px;">
                      Open Live Location in Maps
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Action steps -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb; border:1px solid #fde68a; border-radius:10px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 10px; font-size:13px; font-weight:700; color:#92400e;">Recommended Actions</p>
                    <p style="margin:0 0 6px; font-size:13px; color:#78350f;">1. Try calling ${user.name} immediately</p>
                    <p style="margin:0 0 6px; font-size:13px; color:#78350f;">2. If no response, go to their last known location</p>
                    <p style="margin:0; font-size:13px; color:#78350f;">3. If unreachable, contact emergency services: <strong>999</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0; font-size:12px; color:#6b7280;">
                      This alert was automatically sent by <strong>EkSathe Safety System</strong>.
                      You received this because you are listed as an emergency contact for ${user.name}.
                    </p>
                    <p style="margin:8px 0 0; font-size:12px; color:#9ca3af;">
                      © ${new Date().getFullYear()} EkSathe — Smart Campus Mobility, Dhaka, Bangladesh
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
};

// ── TRIGGER SOS ──────────────────────────────────────────────
export const triggerSOS = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Location coordinates are required.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const contacts = await EmergencyContact.find({ user: req.user.id });
    if (contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No emergency contacts found. Please add at least one contact first.",
      });
    }

    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    const transporter = getTransporter();

    const results = await Promise.allSettled(
      contacts.map((contact) =>
        transporter.sendMail(
          buildSosEmail(user, contact, latitude, longitude, mapsLink),
        ),
      ),
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return res.status(200).json({
      success: true,
      message: `SOS alert sent to ${sent} contact${sent !== 1 ? "s" : ""}.${failed > 0 ? ` ${failed} failed.` : ""}`,
      sent,
      failed,
    });
  } catch (err) {
    console.error("triggerSOS error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send SOS alert." });
  }
};

// ── GET CONTACTS ─────────────────────────────────────────────
export const getContacts = async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ user: req.user.id });
    return res.status(200).json({ success: true, contacts });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── ADD CONTACT ──────────────────────────────────────────────
export const addContact = async (req, res) => {
  try {
    const { name, email, relation } = req.body;

    const count = await EmergencyContact.countDocuments({ user: req.user.id });
    if (count >= 3) {
      return res.status(400).json({
        success: false,
        message: "Maximum 3 emergency contacts allowed.",
      });
    }

    const contact = await EmergencyContact.create({
      user: req.user.id,
      name,
      email,
      relation,
    });

    return res.status(201).json({
      success: true,
      message: "Emergency contact added.",
      contact,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ── DELETE CONTACT ───────────────────────────────────────────
export const deleteContact = async (req, res) => {
  try {
    const contact = await EmergencyContact.findById(req.params.id);
    if (!contact)
      return res
        .status(404)
        .json({ success: false, message: "Contact not found." });
    if (contact.user.toString() !== req.user.id)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized." });

    await contact.deleteOne();
    return res.status(200).json({ success: true, message: "Contact removed." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
