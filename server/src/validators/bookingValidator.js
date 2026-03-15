import { body, param } from "express-validator";

export const validateCreateBooking = [
  body("spotId")
    .notEmpty().withMessage("Spot ID is required")
    .isMongoId().withMessage("Invalid spot ID"),

  body("homeownerId")
    .notEmpty().withMessage("Homeowner ID is required")
    .isMongoId().withMessage("Invalid homeowner ID"),

  body("date")
    .notEmpty().withMessage("Date is required")
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be in YYYY-MM-DD format")
    .custom((value) => {
      const selected = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) throw new Error("Date cannot be in the past");
      return true;
    }),

  body("startTime")
    .notEmpty().withMessage("Start time is required")
    .matches(/^\d{2}:\d{2}$/).withMessage("Start time must be in HH:MM format"),

  body("endTime")
    .notEmpty().withMessage("End time is required")
    .matches(/^\d{2}:\d{2}$/).withMessage("End time must be in HH:MM format")
    .custom((value, { req }) => {
      if (value <= req.body.startTime) {
        throw new Error("End time must be after start time");
      }
      return true;
    }),

  body("totalPrice")
    .notEmpty().withMessage("Total price is required")
    .isFloat({ min: 0 }).withMessage("Total price must be a positive number"),
];

export const validateCancelBooking = [
  param("id")
    .isMongoId().withMessage("Invalid booking ID"),

  body("cancelledBy")
    .notEmpty().withMessage("cancelledBy is required")
    .isIn(["student", "homeowner", "admin"]).withMessage("Invalid cancelledBy value"),
];