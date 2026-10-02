const { z } = require("zod");
const { StructuredOutputParser } = require("@langchain/core/output_parsers");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { getChatModel } = require("../models/llm");

/**
 * 4. STRUCTURED OUTPUT
 *
 * Traditional LLM Workflow:
 *   Text Input ──► LLM ──► Raw Text Output
 *   Problem: Downstream applications cannot reliably consume raw prose.
 *            Blindly calling `JSON.parse()` on raw LLM output is brittle because
 *            models may output markdown tags, extra preamble, or missing fields.
 *
 * LangChain Structured Output Workflow:
 *   Text Request
 *        │
 *        ▼
 *   Zod Schema Definition (types, constraints, required fields)
 *        │
 *        ▼
 *   LangChain StructuredOutputParser (embeds JSON Schema & format instructions)
 *        │
 *        ▼
 *   Free Hugging Face LLM
 *        │
 *        ▼
 *   StructuredOutputParser (.parse() runs Zod validation against the schema)
 *        │
 *        ▼
 *   Validated JavaScript Object (or explicit schema validation error)
 *
 * PROVIDER CAPABILITY NOTE & LIMITATION:
 * Some proprietary models (e.g. OpenAI GPT-4) enforce structured output via native
 * tool/function calling (`model.withStructuredOutput()`). However, open-weights models
 * on Hugging Face's free inference router are hosted across varied community providers
 * (Nebius, Fireworks, Together, TGI) where OpenAI-style tool-calling schema enforcement
 * is often unavailable or disabled on the free tier.
 *
 * LangChain's schema-based `StructuredOutputParser.fromZodSchema` is the most reliable,
 * universal approach: it generates the exact JSON Schema from Zod, instructs the model,
 * and rigorously validates the output using Zod at runtime.
 */

// 1. Define the formal schema with validation rules and descriptions
const TechnologySchema = z.object({
  name: z.string().describe("The canonical name of the technology"),
  category: z.string().describe("The category (e.g. AI Framework, Frontend Library, Database)"),
  description: z.string().describe("A concise 1-2 sentence description of what it does"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).describe("Learning curve difficulty level"),
  useCases: z.array(z.string()).describe("2 to 4 typical real-world use cases or applications"),
});

// 2. Create the LangChain parser bound to the Zod schema
const structuredParser = StructuredOutputParser.fromZodSchema(TechnologySchema);

// 3. Construct the prompt template incorporating the parser's format instructions
const structuredPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a technology analyst. You MUST respond strictly with a valid JSON object matching the requested schema. Do not include introductory conversational text.\n{format_instructions}",
  ],
  [
    "human",
    "Analyze and provide structured information for the technology: {technology}",
  ],
]);

/**
 * Invokes the model and parses the response into a validated object.
 *
 * @param {string} technology - Name of the technology to analyze
 * @returns {Promise<Object>} Validated structured object matching TechnologySchema
 */
async function generateStructuredTechnologyInfo(technology) {
  // Use low temperature for deterministic, schema-compliant output
  const model = getChatModel({ temperature: 0.1 });

  // Compose via LCEL: Prompt -> Model -> StructuredOutputParser
  const chain = structuredPrompt.pipe(model).pipe(structuredParser);

  // Invoke the chain, injecting the schema instructions into the prompt
  const structuredResult = await chain.invoke({
    technology,
    format_instructions: structuredParser.getFormatInstructions(),
  });

  return {
    technology,
    schemaValidated: true,
    data: structuredResult,
  };
}

module.exports = {
  TechnologySchema,
  structuredParser,
  generateStructuredTechnologyInfo,
};
