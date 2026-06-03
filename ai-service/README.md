# BariatricPath AI Service
```python
# AI-USAGE SUMMARY
# Tools: Claude, ChatGPT
# Overall AI Contribution: ~50%
# AI-Assisted Areas: RAG pipeline, prompt templates
# Human Contributions: data content, role logic, testing
# Notes: uses langchain-core modern API
```

A Python FastAPI microservice that powers the AI chat assistant for the BariatricPath
bariatric surgery coordination platform. It uses Retrieval-Augmented Generation (RAG)
to answer questions based on real program knowledge, and adapts its responses based on
the user's role — Patient, Coordinator, or Program Director.

---

## What This Service Does

Instead of relying on a generic AI, this service:

1. Searches a local knowledge base (ChromaDB) built from your program's own CSV data
2. Combines that retrieved knowledge with the user's real status (insurance, specialist, etc.)
3. Sends everything to OpenAI's GPT-4.1-mini model with a role-specific prompt
4. Returns a concise, contextually accurate answer
5. Remembers the last 7 exchanges per session so follow-up questions make sense

This pattern is called RAG — Retrieval Augmented Generation. The AI answers from
YOUR data, not just its training data.

---

## Prerequisites

Before you start, make sure you have these installed on your machine:

| Tool | Version | How to check |
|------|---------|--------------|
| Python | 3.11.x | `python3.11 --version` |
| pip | any recent | `pip --version` |
| Git | any | `git --version` |
| OpenAI API Key | — | Get one at platform.openai.com |

> **Important:** Python 3.13 is NOT supported. The `pydantic-core` dependency
> requires Python 3.11 or 3.12. If you have 3.13, install 3.11 first.

### Install Python 3.11 on Mac

```bash
brew install python@3.11
```

### Install Python 3.11 on Ubuntu/Debian

```bash
sudo apt update
sudo apt install python3.11 python3.11-venv
```

---

## Project Structure

```
ai-service/
├── data/
│   ├── bariatric_program_faq.csv   # Patient-facing Q&A knowledge base
│   ├── coordinator_guide.csv       # Coordinator workflow knowledge base
│   └── director_guide.csv         # Program director metrics knowledge base
├── chroma_db/                      # Auto-generated — do not commit to Git
├── venv/                           # Auto-generated — do not commit to Git
├── main.py                         # FastAPI app entry point
├── rag.py                          # RAG pipeline, prompts, and memory logic
├── load_data.py                    # Script to load CSV data into ChromaDB
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Docker configuration
├── .env                            # Your secrets — never commit this
├── .env.example                    # Template showing required variables
└── .gitignore                      # Excludes venv, chroma_db, .env
```

---

## Installation (Step by Step)

### Step 1 — Clone the repository

```bash
git clone https://github.com/BUMETCS673/cs673olsum26project-cs673olsum26team1.git
cd cs673olsum26project-cs673olsum26team1/ai-service
```

### Step 2 — Create a Python virtual environment

A virtual environment keeps this project's dependencies isolated from the rest
of your system. Always activate it before running anything.

```bash
python3.11 -m venv venv
```

Activate it:

```bash
# Mac / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

You will see `(venv)` appear at the start of your terminal prompt.
This means the virtual environment is active.

### Step 3 — Install dependencies

```bash
pip install -r requirements.txt
```

This installs FastAPI, LangChain, ChromaDB, OpenAI SDK, and all other required
packages. It may take 2-3 minutes the first time.

### Step 4 — Create your environment file

```bash
cp .env.example .env
```

Open `.env` in any text editor and fill in your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-key-here
```

To get an API key:
1. Go to https://platform.openai.com
2. Sign in or create an account
3. Click "API Keys" in the left sidebar
4. Click "Create new secret key"
5. Copy the key and paste it into your `.env` file

> **Cost note:** This service uses `gpt-4.1-mini`. A typical chat message costs
> approximately $0.001–0.002. A $5 credit gives you thousands of test messages.

### Step 5 — Load the knowledge base into ChromaDB

This step converts your CSV training data into vector embeddings and stores them
in ChromaDB. You only need to run this once — or again if you update the CSV files.

```bash
python load_data.py
```

Expected output:

```
Connecting to OpenAI for embeddings...
Loaded 41 documents. Storing in ChromaDB...
Done. ChromaDB saved to ./chroma_db/
Your AI will now answer from BariatricPath-specific content.
```

A `chroma_db/` folder will appear. This is your local vector database.

### Step 6 — Start the service

```bash
uvicorn main:app --reload --port 8000
```

Expected output:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

The service is now running. Open http://localhost:8000/health in your browser.
You should see:

```json
{"status": "ok", "service": "bariatricpath-ai"}
```

---

## Testing the Service Manually

Once the service is running, test it using curl in a new terminal window.

### Test as a Patient

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What does my insurance status mean?",
    "patient_id": 1,
    "patient_context": {
      "insuranceStatus": "not clear",
      "assignedSpecialist": "Obesity Medicine Specialist"
    },
    "role": "PATIENT"
  }'
```

### Test as a Coordinator

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do I update a patient insurance status?",
    "patient_id": 1,
    "patient_context": {"role": "coordinator"},
    "role": "COORDINATOR"
  }'
```

### Test as a Program Director

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What metrics should I track?",
    "patient_id": 1,
    "patient_context": {"role": "program_director"},
    "role": "PROGRAM_DIRECTOR"
  }'
```

You should receive a JSON response like:

```json
{
  "answer": "Your insurance status being not clear means...",
  "sources": ["BariatricPath Program Guide"]
}
```

---

## API Reference

### GET /health

Returns service status. No authentication required.

**Response:**

```json
{"status": "ok", "service": "bariatricpath-ai"}
```

### POST /chat

Accepts a question and returns an AI-generated answer.

**Request body:**

```json
{
  "question": "string — the user's question (required)",
  "patient_id": "integer — used for conversation memory (required)",
  "patient_context": "object — user's current status data (required)",
  "role": "string — PATIENT | COORDINATOR | PROGRAM_DIRECTOR (default: PATIENT)"
}
```

**Response body:**

```json
{
  "answer": "string — the AI's response",
  "sources": ["array of source labels"]
}
```

**Error responses:**
- `400` — question is empty or missing
- `400` — role is not one of the allowed values
- `500` — OpenAI API key not set or service error

---

## How the Knowledge Base Works

### The CSV files

There are three CSV files in the `data/` folder. Each has three columns:

```
question, answer, category
```

- `bariatric_program_faq.csv` — loaded with role tag `patient`
- `coordinator_guide.csv` — loaded with role tag `coordinator`
- `director_guide.csv` — loaded with role tag `program_director`

### Adding or updating knowledge

To add new questions and answers:

1. Open the relevant CSV file in any text editor or Excel
2. Add a new row following this format:
   ```
   "Your question here?","Your answer here.","category_name"
   ```
3. Save the file
4. Delete the old ChromaDB to avoid duplicates:
   ```bash
   rm -rf chroma_db/
   ```
5. Re-run the loader:
   ```bash
   python load_data.py
   ```
6. Restart the service:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### How retrieval works

When a user asks a question:
1. The question is converted into a vector (a list of numbers representing meaning)
2. ChromaDB searches for the 3 most similar vectors from the training data
3. The matching text is passed to GPT along with the question and user context
4. GPT writes an answer using that retrieved content as its reference

This means the AI answers from your program's actual knowledge, not just general AI training.

---

## Conversation Memory

The service keeps track of the last 7 exchanges per user session. This allows
follow-up questions to make sense — the AI remembers what was discussed earlier
in the same conversation.

Memory is keyed by `role_patientId` (for example `PATIENT_42`).

### Current implementation (development)

Memory is stored in a Python dictionary in RAM:

```python
conversation_memory = {}
session_key = f"{role}_{patient_id}"

# Keeps last 7 exchanges to balance context and token cost
for msg in history[-7:]:
    history_str += f"User: {msg['question']}\nAssistant: {msg['answer']}\n"
```

**Limitation:** Memory is lost when the server restarts. Each new server session
starts fresh. This is acceptable for development and demos but not for production.

### Production recommendation

For a production deployment, replace the in-memory dictionary with a persistent
store. Two recommended options:

**Option A — Redis (fastest, recommended for production):**

```python
import redis
import json

r = redis.Redis(host='localhost', port=6379, db=0)

# Save conversation history
r.set(session_key, json.dumps(history), ex=3600)  # expires after 1 hour

# Load conversation history
raw = r.get(session_key)
history = json.loads(raw) if raw else []
```

Install Redis: `brew install redis` (Mac) or `sudo apt install redis` (Linux),
then add `redis==5.0.1` to `requirements.txt`.

**Option B — PostgreSQL via Prisma (if already using it in the project):**

Store each exchange as a row in a `ConversationHistory` table with columns:
`session_key`, `question`, `answer`, `created_at`. Query the last 7 rows
ordered by `created_at DESC` at the start of each request.

---

## Role-Based Behavior

The same RAG pipeline runs for all roles. What changes per role:

| Role | Prompt style | Response length | Knowledge source |
|------|-------------|-----------------|-----------------|
| PATIENT | Warm, encouraging | 2–3 sentences | bariatric_program_faq.csv |
| COORDINATOR | Professional, direct | 3 sentences or steps | coordinator_guide.csv |
| PROGRAM_DIRECTOR | Strategic, data-focused | Max 5 bullet points | director_guide.csv |

If a user asks something outside their role's knowledge base, the AI gives a
helpful general response and suggests contacting the appropriate person.

---

## Running with Docker

If you prefer Docker over a local Python environment:

```bash
# Build the image
docker build -t bariatricpath-ai .

# Run the container
docker run -p 8000:8000 --env-file .env bariatricpath-ai
```

Or using docker-compose from the project root:

```bash
docker-compose up ai-service
```

---

## How This Fits Into the Full Application

The AI service is one of three components that must be running together:

```
React Frontend (port 5173)
        |
        | calls /api/ai/chat
        v
Express Backend (port 5001)
        |
        | forwards to Python service
        v
FastAPI AI Service (port 8000)
        |
        | searches ChromaDB + calls OpenAI
        v
    AI Answer returned up the chain
```

The Express backend in `server/routes/ai.js` acts as a proxy. The frontend
never calls the Python service directly. This keeps authentication (Firebase JWT)
in one place and the AI service stateless.

---

## Troubleshooting

**`pydantic-core` build fails during pip install**

You are using Python 3.13. Install Python 3.11 and recreate the venv:

```bash
brew install python@3.11
rm -rf venv
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**`OPENAI_API_KEY not set` error**

Your `.env` file is missing or the key is not filled in. Check:

```bash
cat .env
```

It should show `OPENAI_API_KEY=sk-...` with your real key.

**`chroma_db` is empty or retrieval returns nothing**

Run the data loader again:

```bash
rm -rf chroma_db/
python load_data.py
```

**Port 8000 already in use**

Another process is using port 8000. Either stop it or run on a different port:

```bash
uvicorn main:app --reload --port 8001
```

Then update `AI_SERVICE_URL` in your Express `.env` to `http://localhost:8001`.

**Blue underlines in VS Code on imports**

VS Code is using the wrong Python interpreter. Press `Cmd+Shift+P`, type
`Python: Select Interpreter`, and choose the one inside `ai-service/venv/bin/python3.11`.

**Answers are too long or include markdown asterisks**

The prompt in `rag.py` controls response length and format. The `PROGRAM_DIRECTOR`
prompt instructs the model to use plain dashes and a maximum of 5 points. If you
see `**bold**` formatting in responses, check that the director prompt includes:
`Use plain text only — no markdown bold or asterisks.`

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key from platform.openai.com |
| `AI_SERVICE_URL` | No | Override for the FastAPI URL (default: http://localhost:8000) |

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.115.5 | Web framework for the API |
| uvicorn | 0.32.1 | ASGI server to run FastAPI |
| openai | 1.55.3 | OpenAI SDK for GPT access |
| langchain | 0.3.7 | Orchestration framework |
| langchain-openai | 0.2.9 | LangChain OpenAI integration |
| langchain-community | 0.3.7 | Community integrations including ChromaDB |
| langchain-core | 0.3.19 | Core LangChain primitives |
| chromadb | 0.5.18 | Local vector database for RAG |
| python-dotenv | 1.0.1 | Loads .env files |
| pydantic | 2.10.3 | Data validation for API models |
| httpx | 0.27.2 | HTTP client |

---

## Contributing

When adding new knowledge to the CSV files, follow the existing format exactly.
Each row must have exactly three columns: `question`, `answer`, `category`.
Wrap all values in double quotes. After any CSV change, delete `chroma_db/`
and re-run `python load_data.py`.

When modifying prompts in `rag.py`, test all three roles after changes since
the same function handles all of them.


