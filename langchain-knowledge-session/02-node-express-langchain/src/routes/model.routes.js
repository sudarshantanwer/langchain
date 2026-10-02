const express = require("express");
const { getChatModel } = require("../models/llm");

const router = express.Router();

/**
 * 1. MODEL ENDPOINT
 * POST /api/model
 *
 * Request:
 * {
 *   "question": "What is LangChain?"
 * }
 *
 * Flow:
 * Express -> LangChain Chat Model (ChatOpenAI pointed to HF) -> Hugging Face Router -> Response
 */
router.post("/model", async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({
      success: false,
      error: "Request body must include a 'question' string.",
    });
  }

  try {
    const model = getChatModel();

    // Directly invoking the LangChain chat model with a string prompt
    // The chat model wraps this into a message and sends it to the Hugging Face router
    const response = await model.invoke(question);

    return res.json({
      success: true,
      topic: "1. Models",
      question,
      answer: response.content,
      modelMetadata: {
        configuredModel: process.env.HF_MODEL,
        responseType: response.constructor.name,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to invoke LangChain chat model",
      details: error.message,
    });
  }
});

module.exports = router;
