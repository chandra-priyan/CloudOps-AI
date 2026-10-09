# CloudOps AI — Setup & Local Execution Guide

## Prerequisites
- Node.js v20+ and npm
- Python 3.11+
- Docker & Docker Compose
- (Optional) Ollama with `qwen2.5-coder` model installed

## Quick Start (Local Development)

### Mode 1: Core Mode (Backend + Frontend + MongoDB)
1. Install root dependencies:
   ```bash
   npm install
   ```
2. Start MongoDB locally or via Docker:
   ```bash
   docker-compose up -d mongodb
   ```
3. Seed MongoDB database:
   ```bash
   npm run seed
   ```
4. Start Backend & Frontend concurrently:
   ```bash
   npm start
   ```
5. Access the Operations Console at `http://localhost:5173`.

---

### Mode 2: Full Observability Mode (Docker Compose)
To run the full stack including FastAPI AI Service, Prometheus, and Grafana:

```bash
docker-compose --profile full up -d --build
```

- **Frontend Console**: `http://localhost:80`
- **Backend API**: `http://localhost:5000`
- **FastAPI AI Service**: `http://localhost:8000/docs`
- **Prometheus UI**: `http://localhost:9090`
- **Grafana Dashboard**: `http://localhost:3000` (User: `admin` / Password: `admin`)
