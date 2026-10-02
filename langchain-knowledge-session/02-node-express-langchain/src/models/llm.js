const { ChatOpenAI } = require("@langchain/openai");

/**
 * 1. MODEL ABSTRACTION
 *
 * In LangChain, a "Chat Model" provides a standardized interface (BaseChatModel)
 * across any underlying LLM provider.
 *
 * Here, we instantiate ChatOpenAI configured to point directly to Hugging Face's
 * OpenAI-compatible Inference Router:
 *   Base URL: https://router.huggingface.co/v1
 *   Auth:     Bearer ${HF_TOKEN}
 *   Model:    ${HF_MODEL}
 *
 * IMPORTANT TEACHING NOTE:
 * Even though the package is `@langchain/openai`, NO request is sent to OpenAI.
 * The OpenAI client specification is used here purely as a standard HTTP protocol
 * client to connect to Hugging Face's free inference endpoints. All inference runs
 * on Hugging Face infrastructure.
 *
 * Why this abstraction matters:
 * 1. Standard API: `.invoke()`, `.batch()`, `.stream()` work the same regardless of provider.
 * 2. Provider Agnostic: Swapping from Hugging Face to another provider only requires
 *    changing the model configuration, not downstream application logic.
 * 3. LCEL Compatibility: LangChain chat models implement the Runnable interface and
 *    can be directly composed into chains using `.pipe()`.
 */

const HF_ROUTER_BASE_URL = "https://router.huggingface.co/v1";

/**
 * Creates and returns a configured LangChain Chat Model pointing to Hugging Face.
 *
 * @param {Object} options Optional overrides (temperature, maxTokens, etc.)
 * @returns {ChatOpenAI} LangChain Chat Model instance
 */
function getChatModel(options = {}) {
  const apiKey = process.env.HF_TOKEN;
  const model = process.env.HF_MODEL || "meta-llama/Llama-3.1-8B-Instruct";

  if (!apiKey || apiKey === "your_huggingface_access_token_here") {
    throw new Error(
      "HF_TOKEN is missing or not configured. Please set your Hugging Face access token in .env."
    );
  }

  return new ChatOpenAI({
    model,
    apiKey,
    configuration: {
      baseURL: HF_ROUTER_BASE_URL,
    },
    temperature: options.temperature ?? 0.7,
    maxTokens: options.maxTokens ?? 500,
  });
}

module.exports = {
  getChatModel,
  HF_ROUTER_BASE_URL,
};
