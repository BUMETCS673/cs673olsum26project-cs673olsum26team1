# BariatricPath

## Overview
Bariatric surgery programs require patients to complete a multi-stage evaluation process involving multiple specialists including surgeons, psychologists, dietitians, and endoscopic specialists before receiving surgical clearance. Today this process is managed through phone calls, spreadsheets, paper checklists, and disconnected systems. Patients have no visibility into their own progress, coordinators manually track dozens of patients across dozens of status columns, and program directors have no real-time insight into pipeline health. This fragmentation causes delays, missed appointments, lost documentation, and patient dropout.

## Purpose
To create a web-based clinical evaluation management system that digitizes and centralizes the entire bariatric journey evaluation workflow. It gives patients a self-service portal to track their progress, gives coordinators a single dashboard to manage all patient statuses and order updates, and gives program directors a real-time view of the full patient pipeline.

## Team Members
- Shaima Nimeri — Team Lead, Requirements Lead, Design/Implementation Lead
- Fatimah Hassan — Security Lead, Configuration Lead
- Kolya Gavlisin — Quality Assurance Lead, Design/Implementation Lead
- Kai Fernandes — Team Lead, Configuration Lead
- Jianing Li — Requirements Lead

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, Bootstrap |
| Backend | Node.js, Express REST API |
| Authentication | Firebase Authentication |
| Database | PostgreSQL + Prisma ORM |
| AI Service | Python FastAPI, OpenAI GPT-4.1-mini, ChromaDB (RAG) |
| Container | Docker, Docker Compose |
| Testing | Jest, Supertest, Vitest, React Testing Library |
| CI/CD | GitHub Actions |
| Project Management | Jira |
| Version Control | Git, GitHub |

---

## Running the Project with Docker (Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Git](https://git-scm.com/) installed
- Firebase credentials (contact your team lead)

### Step 1 — Clone the repository
```bash
git clone https://github.com/BUMETCS673/cs673olsum26project-cs673olsum26team1.git
cd cs673olsum26project-cs673olsum26team1
git checkout dev
```

### Step 2 — Set up environment variables

**Root `.env` — used by Docker Compose to inject Firebase credentials into the backend container:**
```bash
cp .env.example .env
```

Open `.env` and fill in your credentials (get them from the team lead):
```
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
EMAIL_USER="your-email-address@gmail.com"
EMAIL_PASS="your-email-app-password"
OPENAI_API_KEY="sk-your-openai-api-key"
```

> **Note:** `OPENAI_API_KEY` is required for the AI chat service. Without it the AI widget will not work but the rest of the app will run normally.

**Server — copy the example file (only needed for running without Docker):**
```bash
cp server/.env.example server/.env
```

Open `server/.env` and set the following:
```
DATABASE_URL="postgresql://app_user:app_pass@localhost:5433/bariatricpath"
DIRECT_URL="postgresql://app_user:app_pass@localhost:5433/bariatricpath"
FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
PORT=5001
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
EMAIL_USER=""
EMAIL_PASS=""
```

**Client — copy the example file and fill in your Firebase Web SDK credentials:**
```bash
cp client/.env.example client/.env.local
```

Open `client/.env.local` and set the following:
```
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_API_URL="http://localhost:5001/api"
```

### Step 3 — Start the containers
```bash
docker compose up --build
```

Wait until you see all four services ready:
```
bariatricpath-db        | database system is ready to accept connections
bariatricpath-ai        | Uvicorn running on http://0.0.0.0:8000
bariatricpath-backend   | Server running on port 5001
bariatricpath-frontend  | VITE ready in ...ms
```

### Step 4 — Run database migrations

Open a **new terminal** and run:
```bash
docker exec bariatricpath-backend npx prisma migrate deploy
```

Expected output: `No pending migrations to apply.`

### Step 5 — Open the app

Go to **http://localhost:5173** in your browser.

---

## Creating Test Accounts

### Patient account
1. Go to `http://localhost:5173`
2. Click **Create Account**
3. Fill in your name, date of birth, email, and password
4. Complete the BMI calculation and specialist selection steps

### Coordinator or Program Director account
1. Register as a patient first (steps above)
2. Connect to the database:
```bash
docker exec -it bariatricpath-db psql -U app_user -d bariatricpath
```
3. Check what email was registered:
```sql
SELECT id, name, email, role FROM "User";
```
4. Update the role — use the exact email shown in the results:
```sql
UPDATE "User" SET role = 'COORDINATOR' WHERE email = 'your@email.com';
```
For a Program Director:
```sql
UPDATE "User" SET role = 'PROGRAM_DIRECTOR' WHERE email = 'your@email.com';
```
5. Exit psql:
```
\q
```
6. Log out of the app and log back in — the new role will be active.

> **Note:** When running with Docker the app uses a local PostgreSQL database, not Supabase. Supabase credentials will not work locally. You must register a new account through the app.

---

## Stopping the Project
```bash
docker compose down
```

To restart without rebuilding:
```bash
docker compose up
```

To restart and rebuild after code changes:
```bash
docker compose up --build
```

---

## Running Without Docker (Local Development)

### Prerequisites
- Node.js v20+
- PostgreSQL database (local or Supabase)

### Server
```bash
cd server
npm install
npx prisma migrate deploy
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

---

## Running Tests

### Backend tests (Jest)
```bash
cd server
npx jest --no-coverage
```

### Frontend tests (Vitest)
```bash
cd client
npx vitest run
```

---

## Database Access

To connect to the local database while Docker is running:
```bash
docker exec -it bariatricpath-db psql -U app_user -d bariatricpath
```

Useful psql commands:
| Command | Description |
|---|---|
| `\dt` | List all tables |
| `SELECT * FROM "User";` | View all users |
| `SELECT * FROM "Patient";` | View all patients |
| `\q` | Exit psql |

---

## Project Structure
```
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page components
│       ├── context/         # Auth context
│       └── __tests__/       # Frontend tests (Vitest)
├── server/                  # Node.js Express backend
│   ├── routes/              # API route handlers
│   ├── prisma/              # Database schema and migrations
│   ├── middleware/          # Auth middleware
│   ├── searchDB/            # Search and progress logic
│   ├── utils/               # Shared utilities
│   └── __tests__/           # Backend tests (Jest)
├── ai-service/              # Python FastAPI AI microservice
└── docker-compose.yml
```

---

## AI Chat Assistant

The AI service runs as a Docker container (`bariatricpath-ai` on port 8000) and starts automatically with `docker compose up`. It requires an `OPENAI_API_KEY` in the root `.env` file. Without it the AI widget will not respond but the rest of the app works normally.

For full setup details see `ai-service/README.md`.

---

## Deployed Application (Final Release — Iteration 3)

The app is deployed on a Digital Ocean droplet using Docker Compose with all five services running.

| Service | URL |
|---|---|
| Frontend (HTTP) | http://67.205.191.149:5173 |
| Frontend (HTTPS) | https://67.205.191.149 |

> **Note:** The HTTPS URL uses a self-signed certificate. Your browser will show a security warning — click **Advanced** and **Proceed** to continue. This is expected behavior for a self-signed certificate.

**Services running on the droplet:**
- React frontend (port 5173)
- Express backend API with Firebase authentication (port 5001)
- FastAPI AI service with OpenAI GPT and RAG (port 8000)
- PostgreSQL database (Docker container, local to the droplet)
- Nginx reverse proxy (HTTPS on port 443)

> **Known limitation — email notifications:** Confirmation emails will not send on the deployed app because DigitalOcean blocks outbound SMTP on new Droplets. The app will not hang or crash — it silently skips the email and the patient submission completes normally. Email notifications work correctly in local development when `EMAIL_USER` and `EMAIL_PASS` are configured in the root `.env`.
