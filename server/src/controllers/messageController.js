import Message from "../models/Message.js";
import CarpoolRoute from "../models/CarpoolRoute.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import { sendPush } from "../services/pushService.js";

const isParticipant = async (contextType, contextId, userId) => {
  if (contextType === "carpool") {
    const ride = await CarpoolRoute.findById(contextId);
    if (!ride) return false;
    return (
      ride.driver.toString() === userId.toString() ||
      ride.passengers.some((p) => p.toString() === userId.toString())
    );
  }
  if (contextType === "parking") {
    const booking = await Booking.findById(contextId);
    if (!booking) return false;
    return (
      booking.studentId.toString() === userId.toString() ||
      booking.homeownerId.toString() === userId.toString()
    );
  }
  return false;
};

// Get all other participant IDs in a conversation except the sender
const getOtherParticipants = async (contextType, contextId, senderId) => {
  if (contextType === "carpool") {
    const ride = await CarpoolRoute.findById(contextId);
    if (!ride) return [];
    const allIds = [
      ride.driver.toString(),
      ...ride.passengers.map((p) => p.toString()),
    ];
    return allIds.filter((id) => id !== senderId.toString());
  }
  if (contextType === "parking") {
    const booking = await Booking.findById(contextId);
    if (!booking) return [];
    const allIds = [
      booking.studentId.toString(),
      booking.homeownerId.toString(),
    ];
    return allIds.filter((id) => id !== senderId.toString());
  }
  return [];
};

// GET /api/messages/:contextType/:contextId
export const getMessages = async (req, res) => {
  try {
    const { contextType, contextId } = req.params;

    const allowed = await isParticipant(contextType, contextId, req.user.id);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this conversation.",
      });
    }

    const messages = await Message.find({ contextType, contextId })
      .populate("sender", "_id name photoUrl role")
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark all as read by this user
    await Message.updateMany(
      { contextType, contextId, readBy: { $ne: req.user.id } },
      { $addToSet: { readBy: req.user.id } },
    );

    const shaped = messages.map((m) => {
      const obj = m.toObject();
      if (obj.sender && obj.sender._id) {
        obj.sender._id = obj.sender._id.toString();
      }
      return obj;
    });

    return res.status(200).json({ success: true, data: shaped });
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

    const allowed = await isParticipant(contextType, contextId, req.user.id);
    if (!allowed) {
      return res.status(403).json({
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

    const populated = await message.populate(
      "sender",
      "_id name photoUrl role",
    );

    const obj = populated.toObject();
    if (obj.sender?._id) obj.sender._id = obj.sender._id.toString();

    // Push notification to all other participants
    try {
      const senderName = obj.sender?.name || "Someone";
      const messagePreview = text.trim().length > 80
        ? text.trim().slice(0, 80) + "..."
        : text.trim();

      // Build context label for the notification
      let contextLabel = "your chat";
      if (contextType === "carpool") {
        const ride = await CarpoolRoute.findById(contextId);
        if (ride) contextLabel = `${ride.origin.area} → ${ride.destination.area}`;
      } else if (contextType === "parking") {
        const booking = await Booking.findById(contextId).populate("spotId", "title");
        if (booking?.spotId?.title) contextLabel = booking.spotId.title;
      }

      // Get all other participant IDs
      const otherIds = await getOtherParticipants(contextType, contextId, req.user.id);

      // Send push to each participant
      await Promise.all(
        otherIds.map(async (userId) => {
          try {
            const recipient = await User.findById(userId).select("+fcmToken");
            if (!recipient) return;
            await sendPush(
              recipient._id,
              recipient?.fcmToken,
              `New message from ${senderName}`,
              messagePreview,
              "chat_message",
              {
                contextType,
                contextId: contextId.toString(),
              },
            );
          } catch (e) {
            console.warn(`Push to user ${userId} failed:`, e.message);
          }
        }),
      );
    } catch (pushErr) {
      console.warn("Chat push notification failed:", pushErr.message);
    }

    return res.status(201).json({ success: true, data: obj });
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
  } catch {
    return res.status(200).json({ success: true, count: 0 });
  }
};

// POST /api/messages/unread/bulk
export const getBulkUnreadCounts = async (req, res) => {
  try {
    const { contexts } = req.body;
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
  } catch {
    return res.status(200).json({ success: true, data: {} });
  }
};