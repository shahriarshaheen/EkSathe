import UNIVERSITY_ROUTES from "../config/universityRoutes.js";

// GET /api/carpool/presets  —  Public
const getPresetRoutes = (req, res) => {
  res.json({ success: true, data: UNIVERSITY_ROUTES });
};

export { getPresetRoutes };