import api from "../lib/api";

export const userService = {
  // Get full profile
  getProfile: () => api.get("/user/profile"),

  // Update profile — name, phone, gender, photo
  updateProfile: (formData) =>
    api.put("/user/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Delete profile photo
  deletePhoto: () => api.delete("/user/profile/photo"),
};
