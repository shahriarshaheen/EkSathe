import { body, validationResult } from "express-validator";

export const validateCreateSpot = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("address").trim().notEmpty().withMessage("Address is required"),

  body("latitude")
    .notEmpty()
    .withMessage("Latitude is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),

  body("longitude")
    .notEmpty()
    .withMessage("Longitude is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),

  body("pricePerDay")
    .notEmpty()
    .withMessage("Price per day is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("availableFrom")
    .notEmpty()
    .withMessage("Available from time is required")
    .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Invalid time format — use HH:MM"),

  body("availableTo")
    .notEmpty()
    .withMessage("Available to time is required")
    .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Invalid time format — use HH:MM"),

  body("availableDays[]")
    .optional()
    .isIn([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ])
    .withMessage("Invalid day value"),

  body("spotType")
    .optional()
    .isIn(["garage", "driveway", "open"])
    .withMessage("Spot type must be garage, driveway, or open"),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};
