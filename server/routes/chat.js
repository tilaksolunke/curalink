const express = require("express");
const { chat } = require("../controllers/chatController");
const Conversation = require("../models/Conversation");

const router = express.Router();

router.post("/", chat);

router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const conversation = await Conversation.findOne({ sessionId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found.",
      });
    }

    return res.json({
      success: true,
      messages: conversation.messages || [],
      disease: conversation.disease || "",
      location: conversation.location || "",
    });
  } catch (error) {
    console.error("Error fetching conversation history:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch conversation history.",
    });
  }
});

module.exports = router;
