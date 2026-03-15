import api from "../lib/api.js";

export const initiatePayment = async (bookingId) => {
  const response = await api.post(`/payment/initiate/${bookingId}`);
  return response.data;
};