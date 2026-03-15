import api from "../lib/api.js";

export const createBooking = async (data) => {
  const response = await api.post("/bookings", data);
  return response.data;
};

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my");
  return response.data;
};

export const getSpotBookings = async (spotId) => {
  const response = await api.get(`/bookings/spot/${spotId}`);
  return response.data;
};

export const getHomeownerBookings = async () => {
  const response = await api.get("/bookings/homeowner");
  return response.data;
};

export const cancelBooking = async (id, cancelledBy) => {
  const response = await api.patch(`/bookings/${id}/cancel`, { cancelledBy });
  return response.data;
};