const express = require("express");
const { executeMessageFlow } = require("../messages/messages");

const router = express.Router();

/**
 * 2. MESSAGE HANDLING ENDPOINT
 * POST /api/messages
 *
 * Request:
 * {
 *   "question": "Explain LangChain in simple terms"
 * }
 *
 * Flow:
 * SystemMessage + HumanMessage -> Model -> AIMessage
 */
router.post("/messages", async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({
      success: false,
      error: "Request body must include a 'question' string.",
    });
  }

  try {
    const result = await executeMessageFlow(question);

    return res.json({
      success: true,
      topic: "2. Message Handling",
      question,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to execute message handling flow",
      details: error.message,
    });
  }
});

module.exports = router;
