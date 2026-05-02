import api from "../lib/api";

export const getMyRewards = async () => {
  const response = await api.get("/rewards/me");
  return response.data;
};

export const getRewardQuote = async ({ serviceType = "carpool", amount }) => {
  const response = await api.get("/rewards/quote", {
    params: {
      serviceType,
      amount,
    },
  });

  return response.data;
};