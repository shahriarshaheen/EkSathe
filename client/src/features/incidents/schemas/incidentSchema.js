import { z } from "zod";

export const incidentSchema = z.object({
  category: z.enum(
    ["harassment", "unsafe_driving", "theft", "suspicious_activity", "other"],
    { required_error: "Category is required" }
  ),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters"),
  location: z.string().optional(),
  coordinates: z
    .object({
      lat: z.number().nullable().optional(),
      lng: z.number().nullable().optional(),
    })
    .optional(),
});