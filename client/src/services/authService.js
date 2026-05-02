import api from "../lib/api.js";

export const authService = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),

  verifyEmail: (data) =>
    api.post("/auth/verify-email", data).then((r) => r.data),

  login: (data) => api.post("/auth/login", data).then((r) => r.data),

  logout: () => api.post("/auth/logout").then((r) => r.data),

  getMe: () => api.get("/auth/me").then((r) => r.data),

  forgotPassword: (data) =>
    api.post("/auth/forgot-password", data).then((r) => r.data),

  resetPassword: (data) =>
    api.post("/auth/reset-password", data).then((r) => r.data),
};
