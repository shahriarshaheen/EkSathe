import api from "../lib/api.js";

// Parking payment — couponCode optional
export const initiatePayment = async (bookingId, couponCode = null) => {
  const response = await api.post(`/payment/initiate/${bookingId}`, {
    couponCode: couponCode || null,
  });
  return response.data;
};

// Carpool payment — couponCode / coinTierId optional
export const initiateCarpoolPayment = async (routeId, options = {}) => {
  const payload =
    typeof options === "string"
      ? { couponCode: options }
      : {
          couponCode: options.couponCode || null,
          coinTierId: options.coinTierId || null,
        };

  const response = await api.post(
    `/payment/carpool/initiate/${routeId}`,
    payload,
  );

  return response.data;
};
