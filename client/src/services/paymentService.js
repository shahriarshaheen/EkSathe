import api from "../lib/api.js";

// Parking payment — couponCode optional
export const initiatePayment = async (bookingId, couponCode = null) => {
  const response = await api.post(`/payment/initiate/${bookingId}`, {
    couponCode: couponCode || null,
  });
  return response.data;
};

// Carpool payment — couponCode optional
export const initiateCarpoolPayment = async (routeId, couponCode = null) => {
  const response = await api.post(`/payment/carpool/initiate/${routeId}`, {
    couponCode: couponCode || null,
  });
  return response.data;
};
