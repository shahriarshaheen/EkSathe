import express from "express";
import {
  getMessages,
  sendMessage,
  getUnreadCount,
  getBulkUnreadCounts,
} from "../controllers/messageController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

router.get("/unread/bulk", authenticate, getBulkUnreadCounts);
router.get("/unread/:contextType/:contextId", authenticate, getUnreadCount);
router.get("/:contextType/:contextId", authenticate, getMessages);
router.post("/:contextType/:contextId", authenticate, sendMessage);

export default router;
