import express from "express";
import {
  getPendingStudents,
  getAllStudents,
  approveStudent,
  rejectStudent,
  getStats,
} from "../controllers/adminController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(authorize("admin"));

router.get("/stats", getStats);
router.get("/students", getAllStudents);
router.get("/students/pending", getPendingStudents);
router.put("/students/:id/approve", approveStudent);
router.put("/students/:id/reject", rejectStudent);

export default router;
