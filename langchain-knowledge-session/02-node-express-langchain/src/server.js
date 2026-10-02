const path = require("path");
// Load .env relative to the project directory or current working directory
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config();
const express = require("express");
const { HF_ROUTER_BASE_URL } = require("./models/llm");

const modelRoutes = require("./routes/model.routes");
const messageRoutes = require("./routes/message.routes");
const promptRoutes = require("./routes/prompt.routes");
const structuredRoutes = require("./routes/structured.routes");
const lcelRoutes = require("./routes/lcel.routes");
const chainRoutes = require("./routes/chain.routes");

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware for parsing JSON requests
app.use(express.json());

/**
 * Health Check Endpoint
 * Confirms the server is running, the provider is Hugging Face, and displays model details.
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "02-node-express-langchain",
    framework: "LangChain JavaScript (@langchain/core, @langchain/openai)",
    provider: "Hugging Face Inference Providers",
    endpoint: HF_ROUTER_BASE_URL,
    configuredModel: process.env.HF_MODEL || "NOT SET",
    hasToken: Boolean(
      process.env.HF_TOKEN &&
        process.env.HF_TOKEN !== "your_huggingface_access_token_here"
    ),
    teachingTopicsCovered: [
      "1. Models (/api/model)",
      "2. Message Handling (/api/messages)",
      "3. Prompts (/api/prompt)",
      "4. Structured Output (/api/structured)",
      "5. LCEL (/api/lcel)",
      "6. Chains (/api/chain)",
    ],
  });
});

// Mount the 6 core LangChain topic routes
app.use("/api", modelRoutes);
app.use("/api", messageRoutes);
app.use("/api", promptRoutes);
app.use("/api", structuredRoutes);
app.use("/api", lcelRoutes);
app.use("/api", chainRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("[ServerError]:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    details: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`[02-node-express-langchain] Server running on http://localhost:${PORT}`);
  console.log(`[02-node-express-langchain] Model: ${process.env.HF_MODEL || "NOT CONFIGURED"}`);
  console.log(`[02-node-express-langchain] Provider: Hugging Face Router (${HF_ROUTER_BASE_URL})`);
});
