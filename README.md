# CloudOps AI — AI-Powered DevOps Monitoring & Incident Troubleshooting Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker Support](https://img.shields.io/badge/Docker-Dual%20Mode-blue)](docker-compose.yml)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Base%20%2B%20Overlays-blue)](k8s/)
[![FastAPI & Ollama](https://img.shields.io/badge/AI-FastAPI%20%2B%20Ollama-indigo)](ai-service/)

**CloudOps AI** is an enterprise-oriented, end-to-end AI-powered DevOps monitoring and automated incident troubleshooting platform. It integrates container telemetry, Prometheus metrics, and Kubernetes cluster events with LLM evidence reasoning (Ollama Qwen2.5-Coder / FastAPI) to automatically diagnose operational failures, identify root causes, recommend corrective actions, and execute safe, human-in-the-loop remediation workflows.

---

## 🌟 Key Features

- **Dark Operations Console Dashboard**: Real-time metric cards, healthy/degraded service counters, error rate telemetry, and Prometheus time-series trends.
- **AI Evidence Diagnostic Engine**: LLM reasoning engine (FastAPI + Ollama) that ingests container logs and K8s diagnostic events to compute confidence-scored root causes.
- **Fallback Resilience**: Seamless deterministic rule-engine fallback if Ollama or FastAPI is offline.
- **Human-in-the-Loop Remediation**: Strict allowlisted actions (`RESTART_DEPLOYMENT`, `ROLLBACK_DEPLOYMENT`, `SCALE_REPLICAS`, `CLEAR_CONNECTION_POOL`) requiring explicit human approval.
- **Failure Simulation Lab**: 7 built-in failure scenarios (e.g. Database ENOTFOUND DNS loss, Pod OOMKilled, High CPU Thrashing) for testing AI diagnosis and recovery.
- **Full Observability Stack**: Prometheus metric scraping (`/metrics`) and auto-provisioned Grafana dashboards.
- **Production Kubernetes & Terraform**: Multi-stage Dockerfiles, K8s manifests with Kustomize overlays (dev/prod), and AWS EKS Terraform modules.

---

## 🏗️ Repository Architecture

```
CloudOps AI/
├── backend/                # Express Node.js REST API & MongoDB Mongoose Models
├── frontend/               # React + Vite + Tailwind CSS Dark Operations Console
├── ai-service/             # FastAPI Python Service (Ollama Client + Rule Fallback Engine)
├── monitoring/             # Prometheus configuration, Alert Rules & Grafana Dashboards
├── k8s/                    # Kubernetes Base Manifests & Kustomize Dev/Prod Overlays
├── terraform/              # AWS IaC Modules (VPC, EKS, ECR) & Dev Environment
├── docker/                 # Multi-stage Dockerfiles (Backend, Frontend, AI Service, Nginx)
├── scripts/                # Database seed data & setup scripts
└── docs/                   # System Architecture, API Spec & AWS Deployment Guides
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+ & npm
- Python 3.11+
- Docker & Docker Compose

### Quick Local Start (Core Mode)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Seed MongoDB database:
   ```bash
   npm run seed
   ```
3. Launch Backend API & React Console:
   ```bash
   npm start
   ```
4. Access Console at `http://localhost:5173`.

### Full Observability Mode (Docker Compose)
```bash
docker-compose --profile full up -d --build
```
- **Frontend Console**: `http://localhost:80`
- **Backend API**: `http://localhost:5000`
- **FastAPI AI Service**: `http://localhost:8000/docs`
- **Prometheus UI**: `http://localhost:9090`
- **Grafana Dashboard**: `http://localhost:3000` (admin/admin)

---

## 📚 Documentation
- [Architecture Blueprint](docs/architecture.md)
- [REST API Specification](docs/api.md)
- [Setup & Local Execution Guide](docs/setup-guide.md)
- [AWS EKS & Terraform Deployment Guide](docs/aws-guide.md)

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for details.
