import { Router } from "express";
import {
  submitIncident,
  getAllIncidents,
  updateIncidentStatus,
} from "../controllers/incidentController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import {
  validateSubmitIncident,
  validateUpdateIncidentStatus,
} from "../validators/incidentValidator.js";

const router = Router();

router.post("/", authenticate, validateSubmitIncident, submitIncident);
router.get("/", authenticate, authorize("admin"), getAllIncidents);
router.patch("/:id/status", authenticate, authorize("admin"), validateUpdateIncidentStatus, updateIncidentStatus);

export default router;