const express = require("express");
const { runReusableChain } = require("../lcel/chains");

const router = express.Router();

/**
 * 6. CHAINS ENDPOINT
 * POST /api/chain
 *
 * Request:
 * {
 *   "topic": "LangChain"
 * }
 *
 * Flow:
 * Demonstrates chain invocation:
 * const chain = prompt.pipe(model).pipe(parser);
 * const result = await chain.invoke({ topic });
 */
router.post("/chain", async (req, res) => {
  const { topic } = req.body;

  if (!topic || typeof topic !== "string") {
    return res.status(400).json({
      success: false,
      error: "Request body must include a 'topic' string.",
      example: {
        topic: "LangChain",
      },
    });
  }

  try {
    const result = await runReusableChain(topic);

    return res.json({
      success: true,
      topic: "6. Chains",
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Failed to invoke reusable chain",
      details: error.message,
    });
  }
});

module.exports = router;
