import express from "express";
import {
  triggerSOS,
  getContacts,
  addContact,
  deleteContact,
} from "../controllers/sosController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// All SOS routes require authentication
router.post("/trigger", authenticate, triggerSOS);
router.get("/contacts", authenticate, getContacts);
router.post("/contacts", authenticate, addContact);
router.delete("/contacts/:id", authenticate, deleteContact);

export default router;
