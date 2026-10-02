# LangChain Knowledge-Sharing Session (1.5 Hours)

This repository contains two side-by-side Node.js + Express demonstration projects designed for a 1.5-hour hands-on session on LangChain.

```
langchain-knowledge-session/
├── 01-node-express-huggingface/   # Step 1: Baseline LLM application WITHOUT LangChain
└── 02-node-express-langchain/       # Steps 2-7: Progressive LangChain implementation
```

---

## The Core Teaching Premise

1. **Start with the Baseline (`01-node-express-huggingface`)**:
   Show how a modern web application communicates directly with a Large Language Model using standard HTTP `fetch()`. Identify the friction points: fragile string concatenation, manual parsing, lack of schema safety, and tight coupling to vendor endpoints.

2. **Introduce LangChain Progressively (`02-node-express-langchain`)**:
   Demonstrate that LangChain does **not** provide the model's intelligence—the free Hugging Face model does all the reasoning. LangChain provides the architectural building blocks to make LLM applications modular, typed, and composable.

---

## 100% Free LLM via Hugging Face

- **No Paid APIs**: No OpenAI, Anthropic, Gemini, Azure, or AWS Bedrock keys are required.
- **Provider**: Connects to the **Hugging Face OpenAI-compatible Inference Router** (`https://router.huggingface.co/v1`).
- **Free Community Allowance**: Hugging Face provides a free inference quota for community members. Note: This allowance is limited and subject to rate limits or model availability changes.
- **Configurable Model**: Set `HF_MODEL` in `.env` to switch between supported models (e.g., `meta-llama/Llama-3.1-8B-Instruct`, `Qwen/Qwen2.5-7B-Instruct`, `google/gemma-3-4b-it`) without altering code.

---

## Quickstart

### 1. Get your Free Hugging Face Token
1. Sign up at [https://huggingface.co/join](https://huggingface.co/join).
2. Generate a **Read** token at [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).

### 2. Configure Both Projects
```bash
# Project 1: Baseline (Without LangChain)
cd 01-node-express-huggingface
cp .env.example .env
# Edit .env with your HF_TOKEN

# Project 2: LangChain (With LangChain)
cd ../02-node-express-langchain
cp .env.example .env
# Edit .env with your HF_TOKEN
```

### 3. Run Both Servers Side-by-Side
Open two terminal windows:

**Terminal 1 (Project 1 on Port 3001):**
```bash
cd langchain-knowledge-session/01-node-express-huggingface
npm install
npm run dev
```

**Terminal 2 (Project 2 on Port 3002):**
```bash
cd langchain-knowledge-session/02-node-express-langchain
npm install
npm run dev
```

---

## Topics Covered in Project 2

The session strictly focuses on the foundational abstractions of LangChain:

1. **Models** (`/api/model`): Unified interface for LLM interaction (`ChatOpenAI` pointing to Hugging Face).
2. **Message Handling** (`/api/messages`): Role-based communication with `SystemMessage`, `HumanMessage`, and `AIMessage`.
3. **Prompts** (`/api/prompt`): Reusable, parameterized blueprints with `ChatPromptTemplate`.
4. **Structured Output** (`/api/structured`): Enforcing runtime schema validation with Zod and `StructuredOutputParser`.
5. **LCEL** (`/api/lcel`): LangChain Expression Language and UNIX-style piping with `.pipe()`.
6. **Chains** (`/api/chain`): Reusable compositions of Prompt + Model + Parser into a `RunnableSequence`.

---

## 90-Minute Presentation Agenda

| Time | Duration | Activity / Endpoint | Key Concept |
| :--- | :--- | :--- | :--- |
| **00:00 - 00:15** | 15 mins | `01-node-express-huggingface`<br>`POST /api/chat` | Baseline HTTP call to Hugging Face; pain points of manual plumbing |
| **00:15 - 00:30** | 15 mins | `02-node-express-langchain`<br>`POST /api/model` | Model abstraction (`getChatModel`) and provider decoupling |
| **00:30 - 00:45** | 15 mins | `POST /api/messages` | Conversational roles: `SystemMessage`, `HumanMessage`, `AIMessage` |
| **00:45 - 01:00** | 15 mins | `POST /api/prompt` | Parameterized prompt templates with `ChatPromptTemplate` |
| **01:00 - 01:15** | 15 mins | `POST /api/structured` | Unstructured text to validated object using Zod & `StructuredOutputParser` |
| **01:15 - 01:25** | 10 mins | `POST /api/lcel` | LCEL syntax: `prompt.pipe(model).pipe(parser)` |
| **01:25 - 01:30** | 5 mins | `POST /api/chain` | Reusable chain execution via `.invoke()` |
