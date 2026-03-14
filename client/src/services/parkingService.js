import api from "../lib/api";

export const parkingService = {
  // Create a new parking spot (multipart/form-data for photos)
  createSpot: (formData) =>
    api.post("/parking", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Get all spots — optional geo filter
  getSpots: (params = {}) => api.get("/parking", { params }),

  // Get single spot by ID
  getSpotById: (id) => api.get(`/parking/${id}`),

  // Get homeowner's own listings
  getMySpots: () => api.get("/parking/my/listings"),

  // Update a spot (multipart/form-data if photos included)
  updateSpot: (id, formData) =>
    api.put(`/parking/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Delete a spot
  deleteSpot: (id) => api.delete(`/parking/${id}`),
};
