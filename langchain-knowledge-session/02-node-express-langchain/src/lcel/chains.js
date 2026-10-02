const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { StringOutputParser } = require("@langchain/core/output_parsers");
const { getChatModel } = require("../models/llm");

/**
 * 5. LANGCHAIN EXPRESSION LANGUAGE (LCEL) & 6. CHAINS
 *
 * What is LCEL?
 * LCEL is a declarative, functional syntax for composing LangChain components into
 * execution pipelines using the UNIX-inspired `.pipe()` method.
 *
 * The Core Concept: The Runnable Protocol
 * Every LangChain component (Prompt, Model, Parser, Tool) implements the Runnable interface.
 * A Runnable standardizes inputs and outputs:
 *   - invoke(): execute synchronously or sequentially with a single input
 *   - batch(): execute over an array of inputs in parallel
 *   - stream(): yield intermediate output chunks
 *
 * How .pipe() Works:
 * When you write:
 *   const chain = prompt.pipe(model).pipe(parser);
 *
 * 1. `prompt`: Takes raw input variables `{ topic: "RAG" }`, interpolates them into
 *    the template, and outputs formatted `BaseMessage[]` (SystemMessage + HumanMessage).
 * 2. `model`: Receives `BaseMessage[]` from the prompt, calls Hugging Face router,
 *    and outputs an `AIMessage`.
 * 3. `parser` (`StringOutputParser`): Receives the `AIMessage` from the model, extracts
 *    the `.content` string, and outputs a clean JavaScript string.
 *
 * Relationship:
 *   LCEL (The Syntax)
 *          │
 *          ▼
 *   Composition (.pipe)
 *          │
 *          ▼
 *   Chain (The resulting reusable RunnableSequence)
 *
 * No external chain classes (like legacy LLMChain) are needed—LCEL itself produces
 * first-class chains.
 */

// 1. Prompt Component
const topicPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a principal software architect. Provide a clear, high-signal technical explanation with a concrete real-world use case.",
  ],
  ["human", "Explain the concept of {topic} in modern software engineering."],
]);

// 2. Output Parser Component
const stringParser = new StringOutputParser();

/**
 * Factory function creating a reusable LCEL chain:
 *   Prompt ──► Model ──► Parser
 *
 * @param {Object} options - Optional model configuration overrides
 * @returns {Runnable} Reusable LCEL RunnableSequence
 */
function createTopicExplainerChain(options = {}) {
  const model = getChatModel(options);

  // LCEL Composition via .pipe()
  const chain = topicPrompt.pipe(model).pipe(stringParser);

  return chain;
}

/**
 * Executes the LCEL demonstration flow for /api/lcel
 *
 * @param {string} topic - Subject matter
 * @returns {Promise<Object>} Execution metadata and result
 */
async function runLcelPipeline(topic) {
  const chain = createTopicExplainerChain();

  // Invoke the entire pipeline with a single input dictionary
  const result = await chain.invoke({ topic });

  return {
    topic,
    pipeline: "ChatPromptTemplate -> ChatOpenAI (HF Router) -> StringOutputParser",
    result,
  };
}

/**
 * Executes the reusable chain flow for /api/chain
 *
 * @param {string} topic - Subject matter
 * @returns {Promise<Object>} Execution metadata and result
 */
async function runReusableChain(topic) {
  const chain = createTopicExplainerChain();

  const result = await chain.invoke({ topic });

  return {
    topic,
    chainType: "RunnableSequence (LCEL Chain)",
    result,
  };
}

module.exports = {
  topicPrompt,
  stringParser,
  createTopicExplainerChain,
  runLcelPipeline,
  runReusableChain,
};
