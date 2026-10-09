# CloudOps AI — Architecture & Design Blueprint

## 1. System Overview
CloudOps AI is an enterprise-grade, AI-powered DevOps monitoring and automated incident troubleshooting platform. It integrates telemetry data collection from Kubernetes containers, Prometheus, and Grafana with LLM evidence reasoning (via FastAPI and Ollama) to automatically diagnose root causes and recommend safe, allowlisted remediation workflows.

```
[ Frontend: React + Vite + Tailwind ]
            │ (HTTP REST / WebSocket)
            ▼
[ Backend API: Express Node.js Engine ] ◄──► [ MongoDB Persistence ]
      │                     │
      ├── (Metrics Scrape)  ├── (AI Diagnostics Payload)
      ▼                     ▼
[ Prometheus ]         [ FastAPI AI Service ] ◄──► [ Ollama LLM / Rule Fallback ]
```

## 2. Dual Operational Modes

### Mode 1: Core Light Mode
- Components: Express Backend + MongoDB + React Frontend.
- Best for: Rapid local development, UI testing, and standalone incident management.
- AI Fallback: Uses deterministic rule-based engine if Ollama/FastAPI is offline.

### Mode 2: Full Observability Mode
- Components: Express Backend + MongoDB + React Frontend + FastAPI AI Service + Ollama LLM + Prometheus + Grafana.
- Best for: Full observability, real-time alert ingestion, and automated root cause analysis.

## 3. Security & Safety Model
- **Allowlisted Remediation**: Remediation actions are strictly constrained to predefined safe commands: `RESTART_DEPLOYMENT`, `ROLLBACK_DEPLOYMENT`, `SCALE_REPLICAS`, `CLEAR_CONNECTION_POOL`.
- **Human-in-the-loop**: All remediation executions require explicit engineer approval.
- **Dry-Run Mode**: Option to simulate impact prior to live cluster execution.
- **Audit Logging**: Every action generates an immutable audit record in MongoDB.
