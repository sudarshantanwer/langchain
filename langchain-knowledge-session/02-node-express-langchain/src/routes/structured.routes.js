const express = require("express");
const { generateStructuredTechnologyInfo } = require("../structured-output/structured-output");

const router = express.Router();

/**
 * 4. STRUCTURED OUTPUT ENDPOINT
 * POST /api/structured
 *
 * Request:
 * {
 *   "technology": "LangChain"
 * }
 *
 * Response (Validated Object conforming to Zod Schema):
 * {
 *   "success": true,
 *   "topic": "4. Structured Output",
 *   "data": {
 *     "name": "LangChain",
 *     "category": "AI Framework",
 *     "description": "...",
 *     "difficulty": "Intermediate",
 *     "useCases": ["...", "..."]
 *   }
 * }
 */
router.post("/structured", async (req, res) => {
  const { technology } = req.body;

  if (!technology || typeof technology !== "string") {
    return res.status(400).json({
      success: false,
      error: "Request body must include a 'technology' string.",
      example: {
        technology: "LangChain",
      },
    });
  }

  try {
    const result = await generateStructuredTechnologyInfo(technology);

    return res.json({
      success: true,
      topic: "4. Structured Output",
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to produce schema-validated structured output",
      details: error.message,
      note: "LangChain validated the LLM response against the Zod schema. If the LLM failed to adhere to the schema, this validation caught it.",
    });
  }
});

module.exports = router;
