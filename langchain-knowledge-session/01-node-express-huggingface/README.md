# 01-node-express-huggingface: Baseline LLM Application (Without LangChain)

This project demonstrates a direct Node.js + Express application communicating with a **free Hugging Face-hosted Large Language Model (LLM)** without using LangChain.

It serves as **Step 1** of the 1.5-hour knowledge-sharing session, establishing the baseline before introducing LangChain abstractions.

---

## Important: Free Hugging Face LLM

- **100% Free Inference**: This project connects exclusively to Hugging Face's OpenAI-compatible Inference Router (`https://router.huggingface.co/v1`).
- **No Paid APIs Required**: You do **not** need an OpenAI API key, Anthropic API key, Gemini paid key, Azure OpenAI, or AWS Bedrock.
- **Limited Free Allowance**: Hugging Face provides a free inference allowance for community users. It is **not unlimited**, and rate limits or model availability on the serverless router can change over time.
- **Configurable Model (`HF_MODEL`)**: The model is configured via the `HF_MODEL` environment variable. You can change models anytime without changing application code.
- **Inference Location**: Although the API uses an OpenAI-compatible HTTP request schema (`/chat/completions`), the request is sent directly to Hugging Face servers (`router.huggingface.co`). No OpenAI services are invoked.

---

## Baseline Architecture

```
User / HTTP Client
       │
       ▼
Express.js Server (src/server.js)
       │
       │ Native fetch() POST to https://router.huggingface.co/v1/chat/completions
       │ Headers: Authorization: Bearer ${HF_TOKEN}
       ▼
Hugging Face Inference Router
       │
       ▼
Free/Available Model (e.g., meta-llama/Llama-3.1-8B-Instruct)
       │
       ▼
JSON Response: choices[0].message.content
       │
       ▼
Client receives { "success": true, "answer": "..." }
```

---

## Setup & Running

### 1. Create a Free Hugging Face Account
If you do not already have one, create an account at [huggingface.co](https://huggingface.co/join).

### 2. Generate a Hugging Face Access Token
1. Go to **Settings > Access Tokens** (`https://huggingface.co/settings/tokens`).
2. Click **Create new token**.
3. Choose token type: **Read**.
4. Copy the generated token (`hf_...`).

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=3001
HF_TOKEN=hf_your_actual_token_here
HF_MODEL=meta-llama/Llama-3.1-8B-Instruct
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Start the Server
```bash
# Production mode
npm start

# Development mode (auto-reload on save)
npm run dev
```

The server starts on `http://localhost:3001`.

---

## API Endpoints

### 1. Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "01-node-express-huggingface (Direct API Baseline)",
  "provider": "Hugging Face Inference Providers",
  "endpoint": "https://router.huggingface.co/v1/chat/completions",
  "configuredModel": "meta-llama/Llama-3.1-8B-Instruct",
  "hasToken": true
}
```

### 2. Direct Chat
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Explain what an LLM is in simple terms"
}
```

**Response:**
```json
{
  "success": true,
  "answer": "A Large Language Model (LLM) is a type of artificial intelligence designed to understand and generate human-like text..."
}
```

---

## Observations: Why Direct Calls Become Unwieldy

Notice what we had to do manually in `src/server.js`:

1. **Manual HTTP plumbing**: Constructing raw fetch headers, body JSON strings, and handling HTTP response codes.
2. **Provider-coupled format**: We had to construct the exact `{ messages: [{ role: 'user', content }] }` structure required by this endpoint.
3. **No prompt reuse**: Dynamic prompts require string interpolation, making them brittle and hard to sanitize.
4. **Unstructured output**: The model returns raw text. If our application needs structured data (like JSON with validated fields), we would need manual string parsing and risky `JSON.parse()`.
5. **No composition**: There is no clean way to compose preprocessing, prompt generation, model invocation, and postprocessing into reusable pipelines.

These limitations lead directly into **Project 2**, where LangChain introduces standard abstractions to solve each of these problems.
