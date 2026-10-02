const express = require("express");
const { generateFromPromptTemplate } = require("../prompts/prompts");

const router = express.Router();

/**
 * 3. PROMPT TEMPLATES ENDPOINT
 * POST /api/prompt
 *
 * Request:
 * {
 *   "role": "AI Architect",
 *   "topic": "LangChain",
 *   "audience": "beginner"
 * }
 *
 * Flow:
 * Input Variables -> ChatPromptTemplate -> Structured Messages -> Model -> Response
 */
router.post("/prompt", async (req, res) => {
  const { role, topic, audience } = req.body;

  if (!role || !topic || !audience) {
    return res.status(400).json({
      success: false,
      error: "Request body must include 'role', 'topic', and 'audience' strings.",
      example: {
        role: "AI Architect",
        topic: "LangChain",
        audience: "beginner",
      },
    });
  }

  try {
    const result = await generateFromPromptTemplate({ role, topic, audience });

    return res.json({
      success: true,
      topic: "3. Prompts & Templates",
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to generate response from ChatPromptTemplate",
      details: error.message,
    });
  }
});

module.exports = router;
