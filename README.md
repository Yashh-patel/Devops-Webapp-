# ⚡ TaskManager — Node.js + React + Docker + CI/CD

A full-stack task management web app demonstrating production-ready containerization and automated CI/CD with GitHub Actions.

---

## 🏗️ Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Frontend   | React 18, Nginx               |
| Backend    | Node.js 18, Express           |
| Container  | Docker, Docker Compose        |
| CI/CD      | GitHub Actions                |
| Registry   | GitHub Container Registry     |

---

## 📁 Project Structure

```
taskmanager/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express app entry point
│   │   └── routes/tasks.js    # Task CRUD API
│   ├── __tests__/
│   │   └── tasks.test.js      # Jest + Supertest tests
│   ├── Dockerfile             # Multi-stage production build
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js             # React UI (filters, modals, cards)
│   │   └── index.js
│   ├── public/index.html
│   ├── nginx.conf             # SPA routing + API proxy
│   ├── Dockerfile             # Multi-stage: build → Nginx
│   └── package.json
├── .github/
│   └── workflows/
│       └── cicd.yml           # Full CI/CD pipeline
├── docker-compose.yml         # Production setup
├── docker-compose.dev.yml     # Dev with hot-reload
└── README.md
```

---

## 🚀 Quick Start

### Option A — Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/taskmanager.git
cd taskmanager

# Production mode
docker compose up --build

# Open http://localhost:3000
```

### Option B — Dev mode (hot-reload)

```bash
docker compose -f docker-compose.dev.yml up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

### Option C — Without Docker

```bash
# Terminal 1 — Backend
cd backend && cp .env.example .env && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm start
```

---

## 🔌 API Endpoints

| Method | Endpoint          | Description                  |
|--------|-------------------|------------------------------|
| GET    | `/health`         | Health check                 |
| GET    | `/api/tasks`      | List tasks (filter support)  |
| POST   | `/api/tasks`      | Create task                  |
| PATCH  | `/api/tasks/:id`  | Update task                  |
| DELETE | `/api/tasks/:id`  | Delete task                  |

**Query params:** `?status=todo|in-progress|done` · `?priority=low|medium|high`

**Example:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Deploy app","priority":"high","status":"todo"}'
```

---

## 🐳 Docker Details

### Multi-stage Builds
Both Dockerfiles use **multi-stage builds** to keep images small and secure:
- Backend: `deps` stage installs prod dependencies → `production` stage runs as non-root user
- Frontend: `build` stage runs `npm run build` → `production` stage serves with Nginx

### docker-compose.yml
- **backend** — Express API on port 5000, health-checked before frontend starts
- **frontend** — Nginx serving React SPA + proxying `/api/*` to backend
- Containers share a private `taskmanager-net` network

---

## ⚙️ CI/CD Pipeline (GitHub Actions)

The pipeline in `.github/workflows/cicd.yml` has 5 jobs:

```
Push to GitHub
     │
     ▼
┌─────────────┐   ┌──────────────┐
│ test-backend │   │ test-frontend │   (run in parallel)
└──────┬──────┘   └──────┬───────┘
       └────────┬─────────┘
                ▼
        ┌──────────────┐
        │  build-push  │  (Docker images → GHCR)
        └──────┬───────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌──────────────┐
│   staging   │  │  production  │
│  (develop)  │  │    (main)    │
└─────────────┘  └──────────────┘
```

### Secrets required (Settings → Secrets)

| Secret              | Description                  |
|---------------------|------------------------------|
| `STAGING_HOST`      | Staging server IP/hostname   |
| `STAGING_USER`      | SSH username                 |
| `STAGING_SSH_KEY`   | Private SSH key              |
| `PROD_HOST`         | Production server IP         |
| `PROD_USER`         | SSH username                 |
| `PROD_SSH_KEY`      | Private SSH key              |

> `GITHUB_TOKEN` is provided automatically by GitHub Actions — no setup needed.

---

## 🧪 Running Tests

```bash
# Backend tests (Jest + Supertest)
cd backend && npm test

# With coverage report
npm test -- --coverage
```

---

## 📦 Deploying to Your Server

1. SSH into your server and install Docker + Docker Compose
2. Copy `docker-compose.yml` to `/opt/taskmanager/`
3. Add required GitHub Secrets
4. Push to `develop` → auto-deploys to staging
5. Push/merge to `main` → triggers production deploy (with manual approval)
