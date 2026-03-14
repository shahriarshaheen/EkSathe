import { z } from "zod";

export const createSpotSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),

  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  address: z.string().min(1, "Address is required"),

  latitude: z
    .string()
    .min(1, "Location is required")
    .refine((val) => !isNaN(parseFloat(val)), "Invalid latitude"),

  longitude: z
    .string()
    .min(1, "Location is required")
    .refine((val) => !isNaN(parseFloat(val)), "Invalid longitude"),

  pricePerDay: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      "Price must be a positive number",
    ),

  availableFrom: z
    .string()
    .min(1, "Available from time is required")
    .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),

  availableTo: z
    .string()
    .min(1, "Available to time is required")
    .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Invalid time format"),

  spotType: z.enum(["garage", "driveway", "open"]).default("open"),

  availableDays: z
    .array(
      z.enum([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ]),
    )
    .min(1, "Select at least one available day")
    .default(["monday", "tuesday", "wednesday", "thursday", "friday"]),
});
