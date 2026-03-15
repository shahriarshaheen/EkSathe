import { body, param } from "express-validator";

export const validateSubmitIncident = [
  body("category")
    .notEmpty().withMessage("Category is required")
    .isIn(["harassment", "unsafe_driving", "theft", "suspicious_activity", "other"])
    .withMessage("Invalid category"),

  body("description")
    .notEmpty().withMessage("Description is required")
    .isLength({ min: 20 }).withMessage("Description must be at least 20 characters"),

  body("location")
    .optional({ nullable: true })
    .isString().withMessage("Location must be a string"),

  body("coordinates.lat")
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }).withMessage("Invalid latitude"),

  body("coordinates.lng")
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }).withMessage("Invalid longitude"),
];

export const validateUpdateIncidentStatus = [
  param("id")
    .isMongoId().withMessage("Invalid incident ID"),

  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["pending", "reviewed", "resolved"])
    .withMessage("Status must be pending, reviewed, or resolved"),
];