import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    contextType: {
      type: String,
      enum: ["carpool", "parking"],
      required: true,
    },
    contextId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

messageSchema.index({ contextId: 1, createdAt: 1 });
messageSchema.index({ contextId: 1, sender: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
