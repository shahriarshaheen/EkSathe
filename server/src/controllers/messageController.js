import Message from "../models/Message.js";
import CarpoolRoute from "../models/CarpoolRoute.js";
import Booking from "../models/Booking.js";

// ── Authorization check ───────────────────────────────────────
const isParticipant = async (contextType, contextId, userId) => {
  if (contextType === "carpool") {
    const ride = await CarpoolRoute.findById(contextId);
    if (!ride) return false;
    const isDriver = ride.driver.toString() === userId.toString();
    const isPassenger = ride.passengers.some(
      (p) => p.toString() === userId.toString(),
    );
    return isDriver || isPassenger;
  }
  if (contextType === "parking") {
    const booking = await Booking.findById(contextId);
    if (!booking) return false;
    const isStudent = booking.studentId.toString() === userId.toString();
    const isHomeowner = booking.homeownerId.toString() === userId.toString();
    return isStudent || isHomeowner;
  }
  return false;
};

// GET /api/messages/:contextType/:contextId
export const getMessages = async (req, res) => {
  try {
    const { contextType, contextId } = req.params;

    const allowed = await isParticipant(contextType, contextId, req.user.id);
    if (!allowed) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not part of this conversation.",
        });
    }

    const messages = await Message.find({ contextType, contextId })
      .populate("sender", "name photoUrl role")
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark all as read by this user
    await Message.updateMany(
      { contextType, contextId, readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } },
    );

    return res.status(200).json({ success: true, data: messages });
  } catch (err) {
    console.error("getMessages error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// POST /api/messages/:contextType/:contextId
export const sendMessage = async (req, res) => {
  try {
    const { contextType, contextId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message text is required." });
    }
    if (text.trim().length > 500) {
      return res
        .status(400)
        .json({ success: false, message: "Message too long (max 500 chars)." });
    }

    const allowed = await isParticipant(contextType, contextId, req.user.id);
    if (!allowed) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You are not part of this conversation.",
        });
    }

    const message = await Message.create({
      contextType,
      contextId,
      sender: req.user.id,
      text: text.trim(),
      readBy: [req.user.id],
    });

    const populated = await message.populate("sender", "name photoUrl role");
    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("sendMessage error:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// GET /api/messages/unread/:contextType/:contextId
export const getUnreadCount = async (req, res) => {
  try {
    const { contextType, contextId } = req.params;

    const allowed = await isParticipant(contextType, contextId, req.user.id);
    if (!allowed) return res.status(200).json({ success: true, count: 0 });

    const count = await Message.countDocuments({
      contextType,
      contextId,
      readBy: { $ne: req.user.id },
    });

    return res.status(200).json({ success: true, count });
  } catch (err) {
    return res.status(200).json({ success: true, count: 0 });
  }
};

// GET /api/messages/unread/bulk — get unread counts for multiple contexts
export const getBulkUnreadCounts = async (req, res) => {
  try {
    const { contexts } = req.body; // [{ contextType, contextId }]
    if (!Array.isArray(contexts) || contexts.length === 0) {
      return res.status(200).json({ success: true, data: {} });
    }

    const results = {};
    await Promise.all(
      contexts.map(async ({ contextType, contextId }) => {
        const count = await Message.countDocuments({
          contextType,
          contextId,
          readBy: { $ne: req.user.id },
        });
        results[`${contextType}_${contextId}`] = count;
      }),
    );

    return res.status(200).json({ success: true, data: results });
  } catch (err) {
    return res.status(200).json({ success: true, data: {} });
  }
};
