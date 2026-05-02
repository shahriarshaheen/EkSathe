import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    // Who gave the rating
    rater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Who received the rating
    rated: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Context — carpool ride or parking booking
    contextType: {
      type: String,
      enum: ["carpool", "parking"],
      required: true,
    },

    // Reference to the ride or booking
    contextId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    // Role of the rated person in this context
    ratedRole: {
      type: String,
      enum: ["driver", "passenger", "homeowner", "tenant"],
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },
  },
  { timestamps: true },
);

// One rating per rater per context — prevents duplicate ratings
ratingSchema.index({ rater: 1, contextId: 1 }, { unique: true });

// Fast lookup for a user's received ratings
ratingSchema.index({ rated: 1, contextType: 1 });

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
