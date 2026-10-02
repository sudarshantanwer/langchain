const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { getChatModel } = require("../models/llm");

/**
 * 3. PROMPTS & PROMPT TEMPLATES
 *
 * In raw JavaScript, developers often use string concatenation or template literals:
 *   `You are an expert ${role}. Explain ${topic} to a ${audience}.`
 *
 * Why ChatPromptTemplate is superior:
 * 1. Reusability: Defines a prompt blueprint once, populates variables anywhere.
 * 2. Structure Preservation: Produces structured message objects (SystemMessage, HumanMessage)
 *    rather than flat strings.
 * 3. Input Validation: Enforces required input parameters and sanitizes variable interpolation.
 * 4. LCEL Composable: Implements Runnable, allowing `.pipe()` directly into models.
 *
 * Flow:
 *   Input Variables ({ role, topic, audience })
 *                 │
 *                 ▼
 *        ChatPromptTemplate
 *                 │
 *                 ▼
 *   Formatted Messages ([SystemMessage, HumanMessage])
 *                 │
 *                 ▼
 *          LangChain Model
 *                 │
 *                 ▼
 *              Response
 */

// Define the blueprint with placeholders
const educationalPromptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "You are an expert {role}."],
  ["human", "Explain {topic} to a {audience}."],
]);

/**
 * Formats the prompt template with dynamic variables and invokes the model.
 *
 * @param {Object} params
 * @param {string} params.role - The expert persona
 * @param {string} params.topic - The subject to explain
 * @param {string} params.audience - The target learner level
 * @returns {Promise<Object>} Formatted prompt preview and model response
 */
async function generateFromPromptTemplate({ role, topic, audience }) {
  const model = getChatModel();

  // 1. Format the template into structured messages using the input variables
  const formattedMessages = await educationalPromptTemplate.formatMessages({
    role,
    topic,
    audience,
  });

  // 2. Invoke the model with the resulting message array
  const response = await model.invoke(formattedMessages);

  return {
    templateVariables: { role, topic, audience },
    formattedMessages: formattedMessages.map((msg) => ({
      role: msg._getType ? msg._getType() : msg.constructor.name,
      content: msg.content,
    })),
    answer: response.content,
  };
}

module.exports = {
  educationalPromptTemplate,
  generateFromPromptTemplate,
};
