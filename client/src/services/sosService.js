import api from "../lib/api";

export const sosService = {
  // Trigger SOS — send SMS to all emergency contacts
  triggerSOS: (latitude, longitude) =>
    api.post("/sos/trigger", { latitude, longitude }),

  // Get emergency contacts
  getContacts: () => api.get("/sos/contacts"),

  // Add emergency contact
  addContact: (data) => api.post("/sos/contacts", data),

  // Delete emergency contact
  deleteContact: (id) => api.delete(`/sos/contacts/${id}`),
};
