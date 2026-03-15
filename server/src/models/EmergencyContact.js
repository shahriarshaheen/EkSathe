import mongoose from "mongoose";

const emergencyContactSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
    },
    relation: {
      type: String,
      trim: true,
      maxlength: [50, "Relation cannot exceed 50 characters"],
    },
  },
  { timestamps: true },
);

emergencyContactSchema.index({ user: 1 });

const EmergencyContact = mongoose.model(
  "EmergencyContact",
  emergencyContactSchema,
);

export default EmergencyContact;
