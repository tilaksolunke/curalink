const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    disease: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    publications: {
      type: Array,
      default: []
    },
    trials: {
      type: Array,
      default: []
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
