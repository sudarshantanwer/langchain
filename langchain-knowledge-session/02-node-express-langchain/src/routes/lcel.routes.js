const express = require("express");
const { runLcelPipeline } = require("../lcel/chains");

const router = express.Router();

/**
 * 5. LCEL ENDPOINT
 * POST /api/lcel
 *
 * Request:
 * {
 *   "topic": "RAG"
 * }
 *
 * Flow:
 * Input ({ topic }) -> Prompt (ChatPromptTemplate) -> Model (ChatOpenAI pointed to HF) -> Parser (StringOutputParser) -> Clean String
 */
router.post("/lcel", async (req, res) => {
  const { topic } = req.body;

  if (!topic || typeof topic !== "string") {
    return res.status(400).json({
      success: false,
      error: "Request body must include a 'topic' string.",
      example: {
        topic: "RAG",
      },
    });
  }

  try {
    const result = await runLcelPipeline(topic);

    return res.json({
      success: true,
      topic: "5. LangChain Expression Language (LCEL)",
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to execute LCEL pipeline",
      details: error.message,
    });
  }
});

module.exports = router;
