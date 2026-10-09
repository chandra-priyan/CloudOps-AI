# CloudOps AI — REST API Documentation

Base Endpoint: `/api/v1`

## 1. Health & Status
- `GET /health` — Check backend health and MongoDB connection status.
- `GET /metrics` — Prometheus metrics scrape endpoint.

## 2. Dashboard
- `GET /api/v1/dashboard/overview` — Get aggregated cluster telemetry, service health counters, and active incident queue.

## 3. Monitored Services
- `GET /api/v1/services` — List all monitored workloads.
- `GET /api/v1/services/:name` — Get deep-dive telemetry and logs for specific service.

## 4. Incidents & AI Diagnostics
- `GET /api/v1/incidents` — List incidents (supports `severity`, `status`, `limit` query parameters).
- `GET /api/v1/incidents/:id` — Get detailed incident record with AI diagnosis context.
- `POST /api/v1/ai/diagnose` — Trigger AI root cause diagnosis for an incident.
- `POST /api/v1/incidents/:id/notes` — Add investigative note.

## 5. Failure Simulation Lab
- `GET /api/v1/simulations` — List 7 pre-configured failure scenarios.
- `POST /api/v1/simulations/trigger` — Trigger failure simulation scenario and auto-generate incident.

## 6. Remediation & Safety
- `POST /api/v1/remediation/execute` — Execute allowlisted remediation action (supports `dryRun: true/false`).
- `GET /api/v1/audit-logs` — Fetch security audit trail.
