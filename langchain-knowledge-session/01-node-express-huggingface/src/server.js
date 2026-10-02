const path = require("path");
// Load .env relative to the project directory or current working directory
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Hugging Face OpenAI-compatible router endpoint
// Model inference happens on Hugging Face infrastructure, NOT OpenAI.
const HF_ROUTER_URL = "https://router.huggingface.co/v1/chat/completions";

/**
 * Health Check Endpoint
 * Confirms the server is running and displays the active model configuration.
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "01-node-express-huggingface (Direct API Baseline)",
    provider: "Hugging Face Inference Providers",
    endpoint: HF_ROUTER_URL,
    configuredModel: process.env.HF_MODEL || "NOT SET",
    hasToken: Boolean(process.env.HF_TOKEN && process.env.HF_TOKEN !== "your_huggingface_access_token_here"),
  });
});

/**
 * Direct Chat Endpoint (WITHOUT LangChain)
 *
 * Flow:
 * User Request -> Express -> Direct HTTP fetch() -> Hugging Face Router -> Model Inference -> Response
 *
 * Demonstrates the baseline approach before introducing LangChain:
 * 1. Manually formatting the messages array
 * 2. Manually making the HTTP POST request to Hugging Face
 * 3. Manually extracting the answer from choices[0].message.content
 * 4. Manually handling status codes and errors
 */
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      success: false,
      error: "Request body must include a 'message' string.",
    });
  }

  const hfToken = process.env.HF_TOKEN;
  const hfModel = process.env.HF_MODEL;

  if (!hfToken || hfToken === "your_huggingface_access_token_here") {
    return res.status(500).json({
      success: false,
      error: "HF_TOKEN is missing or not configured. Please set your Hugging Face access token in .env.",
    });
  }

  if (!hfModel) {
    return res.status(500).json({
      success: false,
      error: "HF_MODEL is not configured. Please set HF_MODEL in .env (e.g. meta-llama/Llama-3.1-8B-Instruct).",
    });
  }

  try {
    // Direct HTTP request to Hugging Face OpenAI-compatible inference router
    const response = await fetch(HF_ROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: hfModel,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError;
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = { raw: errorText };
      }

      return res.status(response.status).json({
        success: false,
        error: `Hugging Face API error (${response.status})`,
        details: parsedError,
        hint: response.status === 401
          ? "Check that your HF_TOKEN is valid and has read permissions."
          : response.status === 429
          ? "Hugging Face free rate limit reached. Please wait a moment or try another model."
          : "Verify the model is available on Hugging Face router.",
      });
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content || "";

    return res.json({
      success: true,
      answer,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error communicating with Hugging Face",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`[01-node-express-huggingface] Server running on http://localhost:${PORT}`);
  console.log(`[01-node-express-huggingface] Model: ${process.env.HF_MODEL || "NOT CONFIGURED"}`);
  console.log(`[01-node-express-huggingface] Provider: Hugging Face Inference Router (${HF_ROUTER_URL})`);
});
