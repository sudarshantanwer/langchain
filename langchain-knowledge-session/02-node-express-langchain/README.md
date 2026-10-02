# LangChain Basic LLM Application

A production-grade, teaching-focused demonstration project built with **Node.js**, **Express**, and **LangChain JavaScript** for a 1.5-hour knowledge-sharing session.

This project connects to a **free, Hugging Face-hosted LLM** via Hugging Face's OpenAI-compatible Inference Router.

---

## Important: Free LLM

- **Hugging Face as LLM Provider**: All model inference in this project is executed on Hugging Face infrastructure.
- **No Paid APIs Required**: No paid OpenAI API key, Anthropic API key, Google Gemini paid API, Azure OpenAI, or AWS Bedrock account is required.
- **Limited Free Allowance**: Hugging Face provides a limited free community inference allowance on serverless models. The API is **not unlimited** and **not guaranteed to be permanently free**. Free tier rate limits (e.g. 429 status codes) or temporary model unavailability may occur under high load.
- **Configurable Model (`HF_MODEL`)**: The active model is fully configurable via the `HF_MODEL` environment variable. You can switch to any other free model currently available on the Hugging Face router without modifying any application code.
- **Protocol Note**: LangChain's `@langchain/openai` package is utilized here strictly as an HTTP protocol client pointing to Hugging Face's router (`https://router.huggingface.co/v1`). No traffic is sent to OpenAI.

---

## Setup

Follow these exact steps to configure and run the project:

### 1. Create a Hugging Face Account
Sign up for a free account at [https://huggingface.co/join](https://huggingface.co/join) if you do not have one.

### 2. Generate a Hugging Face Access Token
1. Navigate to **Settings > Access Tokens** at [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
2. Click **Create new token**.
3. Select the **Read** permission scope.
4. Copy your token (starts with `hf_...`).

### 3. Copy Environment Configuration
```bash
cp .env.example .env
```

### 4. Configure Your Token and Model
Edit `.env` and set your credentials:
```env
PORT=3002
HF_TOKEN=hf_your_actual_token_here
HF_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

*Alternative free Hugging Face models you can switch to anytime:*
- `meta-llama/Llama-3.1-8B-Instruct` (Default, excellent instruction following)
- `Qwen/Qwen2.5-7B-Instruct`
- `Qwen/Qwen2.5-Coder-7B-Instruct`
- `google/gemma-3-4b-it`

### 5. Install Dependencies
```bash
npm install
```

### 6. Run the Application
```bash
# Production mode
npm start

# Development mode (with live file watching)
npm run dev
```

The server starts on `http://localhost:3002`.

---

## Without LangChain vs With LangChain

A fundamental concept for this session is understanding what LangChain does and does not do.

> **Crucial Rule:** LangChain does **NOT** provide the intelligence of the LLM. The intelligence, knowledge, reasoning, and weights reside entirely inside the underlying Hugging Face model (`meta-llama/Llama-3.1-8B-Instruct`). LangChain provides the **developer abstractions** that make LLM application components predictable, modular, and easy to compose.

### Architecture Comparison

#### WITHOUT LANGCHAIN (`01-node-express-huggingface`)
```
User Request
     │
     ▼
Express Controller
     │
     │ Raw fetch() HTTP request with hardcoded JSON headers and body
     ▼
Hugging Face Inference Router
     │
     ▼
LLM
     │
     │ Raw string answer inside nested JSON
     ▼
Manual Response Parsing & Error Handling
```
*Disadvantages:* String interpolation is fragile, no validation on outputs, provider lock-in, and repetitive boilerplate across every endpoint.

#### WITH LANGCHAIN (`02-node-express-langchain`)
```
User Request
     │
     ▼
Express Route
     │
     ▼
ChatPromptTemplate  ──► Enforces structured variables & message roles
     │
     ▼
ChatOpenAI (HF)     ──► Standardized Runnable interface across any LLM
     │
     ▼
Output Parser       ──► Validates output schema (Zod) or parses strings
     │
     ▼
Reusable Chain      ──► Composed with LCEL .pipe()
```
*Advantages:* Composable, typed, schema-validated, easily switchable models, and minimal glue code.

---

## Teaching Progression

The session teaches these 6 core concepts in sequential order. Notice how each concept directly solves the limitation of the previous one:

```
1. Models ──► 2. Messages ──► 3. Prompts ──► 4. Structured Output ──► 5. LCEL ──► 6. Chains
```

### 1. Models (`src/models/llm.js` & `/api/model`)
- **Concept:** A Model is an abstraction over the LLM provider API.
- **Why it matters:** Instead of hardcoding HTTP endpoints, HTTP headers, authentication formats, and response parsing for each vendor, LangChain chat models expose a single unified interface: `.invoke()`.
- **How it works:** `ChatOpenAI` is configured with `baseURL: "https://router.huggingface.co/v1"` and `apiKey: process.env.HF_TOKEN`. You can switch providers or models without changing a single line of business logic.

### 2. Message Handling (`src/messages/messages.js` & `/api/messages`)
- **Concept:** LLMs do not simply accept flat strings; modern chat models are trained on distinct conversational roles.
- **The Core Types:**
  - `SystemMessage`: Dictates instructions, personas, boundaries, and formatting rules.
  - `HumanMessage`: Represents the user's prompt or question.
  - `AIMessage`: Represents the output produced by the LLM.
- **Progression from Step 1:** Step 1 passed a raw string to `model.invoke(question)`. Step 2 introduces role separation so you can enforce system guardrails independently of user questions.

### 3. Prompts & Templates (`src/prompts/prompts.js` & `/api/prompt`)
- **Concept:** Prompts should not be hand-rolled with string concatenation. `ChatPromptTemplate` provides reusable, parameterized prompt blueprints.
- **Example:**
  ```javascript
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are an expert {role}."],
    ["human", "Explain {topic} to a {audience}."],
  ]);
  ```
- **Progression from Step 2:** In Step 2, we hardcoded message contents. In Step 3, `ChatPromptTemplate` transforms dynamic input dictionaries `{ role, topic, audience }` into strongly-typed `[SystemMessage, HumanMessage]` arrays automatically.

### 4. Structured Output (`src/structured-output/structured-output.js` & `/api/structured`)
- **Concept:** Transforming unstructured natural language text into schema-validated application data.
- **The Workflow:**
  - Standard LLM: `Text` ──► `Text`
  - Structured Output: `Text Request` ──► `LLM` ──► `Validated Structured Object`
- **Implementation:** Uses Zod to define a strict schema (`name`, `category`, `description`, `difficulty`, `useCases`). LangChain's `StructuredOutputParser.fromZodSchema(schema)` injects JSON formatting instructions into the prompt and validates the resulting JSON against the Zod schema at runtime. If the output violates the schema, it throws an explicit validation error.
- **Provider Capability Note:** While proprietary APIs (like OpenAI) enforce structured output via native function calling, free open models on Hugging Face's serverless router are hosted across community backends where function calling is often unsupported. `StructuredOutputParser` provides the most reliable, universal schema-enforcement mechanism for open-source Hugging Face models.
- **Progression from Step 3:** Step 3 produced unstructured text strings. Step 4 ensures the output can be directly stored in a database or passed to another API as a validated JavaScript object.

### 5. LangChain Expression Language (LCEL) (`src/lcel/chains.js` & `/api/lcel`)
- **Concept:** LCEL is a declarative, functional composition syntax utilizing the UNIX-style `.pipe()` method.
- **The Runnable Protocol:** Every LangChain component (Prompt, Model, Parser) implements the `Runnable` interface. The output of one component becomes the input to the next:
  ```javascript
  prompt.pipe(model).pipe(parser)
  ```
- **Data Flow:**
  1. `prompt`: takes `{ topic: "RAG" }` ──► outputs `BaseMessage[]`
  2. `model`: takes `BaseMessage[]` ──► outputs `AIMessage`
  3. `parser` (`StringOutputParser`): takes `AIMessage` ──► outputs clean `string`
- **Progression from Step 4:** In previous steps, we manually called `.formatMessages()`, passed results to `model.invoke()`, and manually passed output to parsers. LCEL unifies these into a single fluent pipeline.

### 6. Chains (`src/lcel/chains.js` & `/api/chain`)
- **Concept:** A Chain is the resulting reusable, executable component formed by composing primitives with LCEL.
- **The Relationship:**
  $$\text{LCEL (Syntax)} \longrightarrow \text{Composition (.pipe)} \longrightarrow \text{Chain (RunnableSequence)}$$
- **Code:**
  ```javascript
  const chain = prompt.pipe(model).pipe(parser);
  const result = await chain.invoke({ topic: "LangChain" });
  ```
- **Progression from Step 5:** Step 5 showed the syntax of `.pipe()`. Step 6 demonstrates how the resulting chain is exported as a standalone, reusable object that can be invoked repeatedly across different routes or services.

---

## 1.5-Hour Session Flow

Use this step-by-step roadmap to deliver the presentation:

### Step 1 — Direct LLM Call (15 mins)
1. Open directory `01-node-express-huggingface`.
2. Inspect `src/server.js`: show how `fetch()` calls `https://router.huggingface.co/v1/chat/completions`.
3. Send a test request via `examples/requests.http`:
   ```http
   POST http://localhost:3001/api/chat
   { "message": "Explain what an LLM is in simple terms" }
   ```
4. Point out the pain points: manual JSON building, no prompt reuse, no schema validation, manual error handling.

### Step 2 — LangChain Model Abstraction (15 mins)
1. Switch to `02-node-express-langchain`.
2. Inspect `src/models/llm.js`. Explain `ChatOpenAI` configured for Hugging Face's router.
3. Test `POST http://localhost:3002/api/model` with `{ "question": "What is LangChain?" }`.
4. Emphasize: LangChain does not replace the LLM; it abstracts the communication layer.

### Step 3 — Message Handling (15 mins)
1. Inspect `src/messages/messages.js`.
2. Explain why chat models need `SystemMessage`, `HumanMessage`, and `AIMessage`.
3. Test `POST http://localhost:3002/api/messages` with `{ "question": "Explain LangChain in simple terms" }`.
4. Show how the system prompt guides the persona while the human prompt carries the question.

### Step 4 — Prompt Templates (15 mins)
1. Inspect `src/prompts/prompts.js`.
2. Explain `ChatPromptTemplate.fromMessages(...)` and variable interpolation.
3. Test `POST http://localhost:3002/api/prompt`:
   ```json
   {
     "role": "AI Architect",
     "topic": "LangChain",
     "audience": "beginner"
   }
   ```
4. Contrast this with fragile string concatenation.

### Step 5 — Structured Output (15 mins)
1. Inspect `src/structured-output/structured-output.js`.
2. Walk through the Zod schema (`TechnologySchema`) and `StructuredOutputParser.fromZodSchema()`.
3. Test `POST http://localhost:3002/api/structured` with `{ "technology": "LangChain" }`.
4. Demonstrate that the response is a parsed, type-checked JSON object ready for application logic.

### Step 6 — LCEL (.pipe) (10 mins)
1. Inspect `src/lcel/chains.js`.
2. Walk through `prompt.pipe(model).pipe(parser)`.
3. Test `POST http://localhost:3002/api/lcel` with `{ "topic": "RAG" }`.
4. Explain how each step's output matches the next step's expected input type.

### Step 7 — Chains (5 mins) & Wrap-Up (5 mins)
1. Inspect `src/routes/chain.routes.js`.
2. Show that `chain.invoke({ topic: "LangChain" })` encapsulates the entire workflow into one call.
3. Test `POST http://localhost:3002/api/chain`.
4. Q&A and final summary.

---

## Complete API Reference (Project 2)

| Method | Endpoint | Description | Sample Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health & model configuration | _None_ |
| `POST` | `/api/model` | Direct LangChain chat model invocation | `{"question": "What is LangChain?"}` |
| `POST` | `/api/messages` | SystemMessage + HumanMessage ──► AIMessage | `{"question": "Explain LangChain in simple terms"}` |
| `POST` | `/api/prompt` | ChatPromptTemplate parameterization | `{"role": "AI Architect", "topic": "LangChain", "audience": "beginner"}` |
| `POST` | `/api/structured` | Schema-validated structured output (Zod) | `{"technology": "LangChain"}` |
| `POST` | `/api/lcel` | LCEL pipeline demonstration (`.pipe`) | `{"topic": "RAG"}` |
| `POST` | `/api/chain` | Reusable chain execution | `{"topic": "LangChain"}` |
