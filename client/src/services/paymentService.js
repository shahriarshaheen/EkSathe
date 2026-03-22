import api from "../lib/api.js";

// Parking payment
export const initiatePayment = async (bookingId) => {
  const response = await api.post(`/payment/initiate/${bookingId}`);
  return response.data;
};

// Carpool payment — called after joining a ride
export const initiateCarpoolPayment = async (routeId) => {
  const response = await api.post(`/payment/carpool/initiate/${routeId}`);
  return response.data;
};
