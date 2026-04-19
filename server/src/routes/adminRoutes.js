import express from "express";
import {
  getPendingStudents,
  getAllStudents,
  getAllUsers,
  approveStudent,
  rejectStudent,
  suspendUser,
  unsuspendUser,
  getStats,
} from "../controllers/adminController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/stats", getStats);
router.get("/students", getAllStudents);
router.get("/students/pending", getPendingStudents);
router.put("/students/:id/approve", approveStudent);
router.put("/students/:id/reject", rejectStudent);

// User management
router.get("/users", getAllUsers);
router.patch("/users/:id/suspend", suspendUser);
router.patch("/users/:id/unsuspend", unsuspendUser);

export default router;
