import { z } from "zod";

export const bookingSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  startTime: z
    .string()
    .min(1, "Start time is required")
    .regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  endTime: z
    .string()
    .min(1, "End time is required")
    .regex(/^\d{2}:\d{2}$/, "Invalid time format"),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});