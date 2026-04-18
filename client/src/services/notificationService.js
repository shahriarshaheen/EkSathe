import api from "../lib/api.js";

export const getMyNotifications = async () => {
  const res = await api.get("/notifications/my");
  return res.data;
};

export const markAsRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllAsRead = async () => {
  const res = await api.patch("/notifications/read-all");
  return res.data;
};