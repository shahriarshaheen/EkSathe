import api from "../lib/api.js";

export const submitIncident = async (data) => {
  const response = await api.post("/incidents", data);
  return response.data;
};

export const getIncidents = async () => {
  const response = await api.get("/incidents");
  return response.data;
};

export const updateIncidentStatus = async (id, status) => {
  const response = await api.patch(`/incidents/${id}/status`, { status });
  return response.data;
};