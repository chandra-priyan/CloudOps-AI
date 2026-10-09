from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import httpx
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

app = FastAPI(
    title="CloudOps AI Troubleshooting Service",
    description="FastAPI service for LLM-driven diagnostic evidence analysis and root cause identification",
    version="1.0.0"
)

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder")

class DiagnosticPayload(BaseModel):
    incidentId: str
    serviceName: str
    triggerReason: Optional[str] = ""
    logsContext: List[str] = []
    k8sEventsContext: List[str] = []
    metricsContext: Optional[dict] = None

class AIDiagnosisResponse(BaseModel):
    summary: str
    probableRootCause: str
    confidenceLevel: str = Field(description="High, Medium, or Low")
    supportingEvidence: List[str]
    alternativeExplanations: List[str]
    diagnosticCommands: List[str]
    recommendedRemediation: str
    riskLevel: str = Field(description="High, Medium, or Low")
    modelName: str = OLLAMA_MODEL

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "cloudops-ai-service"}

@app.get("/api/v1/ai/status")
async def ai_status():
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            res = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if res.status_code == 200:
                return {"ollamaAvailable": True, "model": OLLAMA_MODEL, "endpoint": OLLAMA_BASE_URL}
    except Exception as e:
        logger.warning(f"Ollama connection check failed: {e}")
    
    return {"ollamaAvailable": False, "fallbackMode": "RuleBasedEngine", "model": OLLAMA_MODEL}

@app.post("/api/v1/ai/diagnose", response_model=AIDiagnosisResponse)
async def diagnose_incident(payload: DiagnosticPayload):
    logger.info(f"Received diagnostic request for incident {payload.incidentId} (service: {payload.serviceName})")
    
    # Try Ollama model request first
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            prompt = f"""You are an expert DevOps engineer and SRE troubleshooting a production failure.
Target Service: {payload.serviceName}
Trigger Reason: {payload.triggerReason}
Logs Context:
{chr(10).join(payload.logsContext)}
K8s Events Context:
{chr(10).join(payload.k8sEventsContext)}

Analyze the diagnostic context above and determine the root cause, supporting evidence, diagnostic kubectl commands, and recommended remediation.
Return JSON matching:
- summary: string
- probableRootCause: string
- confidenceLevel: High/Medium/Low
- supportingEvidence: array of strings
- alternativeExplanations: array of strings
- diagnosticCommands: array of strings
- recommendedRemediation: string
- riskLevel: High/Medium/Low
"""
            res = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False, "format": "json"}
            )
            if res.status_code == 200:
                data = res.json()
                import json
                parsed = json.loads(data.get("response", "{}"))
                return AIDiagnosisResponse(
                    summary=parsed.get("summary", f"AI evidence diagnosis for {payload.serviceName}"),
                    probableRootCause=parsed.get("probableRootCause", payload.triggerReason or "Unknown runtime failure"),
                    confidenceLevel=parsed.get("confidenceLevel", "High"),
                    supportingEvidence=parsed.get("supportingEvidence", payload.logsContext[:2]),
                    alternativeExplanations=parsed.get("alternativeExplanations", ["Intermittent network latency"]),
                    diagnosticCommands=parsed.get("diagnosticCommands", [f"kubectl logs deployment/{payload.serviceName}"]),
                    recommendedRemediation=parsed.get("recommendedRemediation", f"Restart deployment {payload.serviceName}"),
                    riskLevel=parsed.get("riskLevel", "Medium"),
                    modelName=OLLAMA_MODEL
                )
    except Exception as err:
        logger.warning(f"Ollama execution unavailable ({err}). Falling back to rule engine...")

    # Fallback Rule Engine
    return fallback_rule_engine(payload)

def fallback_rule_engine(payload: DiagnosticPayload) -> AIDiagnosisResponse:
    logs_str = " ".join(payload.logsContext).lower()
    
    if "enotfound" in logs_str or "dns" in logs_str or "host" in logs_str:
        return AIDiagnosisResponse(
            summary=f"Database connection failure due to invalid hostname resolution in {payload.serviceName}.",
            probableRootCause="DNS Resolution Failure / Incorrect ConfigMap Database Hostname",
            confidenceLevel="High",
            supportingEvidence=[
                "Diagnostic logs show ENOTFOUND network resolution failure",
                "Application failed to bind to database socket connection"
            ],
            alternativeExplanations=["CoreDNS cluster pod degradation"],
            diagnosticCommands=[
                f"kubectl get configmap {payload.serviceName}-config -o yaml",
                "kubectl get pods -n kube-system -l k8s-app=kube-dns"
            ],
            recommendedRemediation=f"Verify MONGODB_URI hostname in ConfigMap or perform rolling restart of {payload.serviceName}.",
            riskLevel="Medium",
            modelName="RuleBasedDiagnosticEngine"
        )
    
    if "oomkilled" in logs_str or "heap" in logs_str or "out of memory" in logs_str:
        return AIDiagnosisResponse(
            summary=f"Memory leak causing container OOMKilled crash termination in {payload.serviceName}.",
            probableRootCause="Memory Pressure / Unbounded Object Allocation Leak",
            confidenceLevel="High",
            supportingEvidence=[
                "Kernel sent exit code 137 (OOMKilled) signal to pod container",
                "Elevated heap usage exceeded assigned cgroup memory limit"
            ],
            alternativeExplanations=["Traffic burst exceeding memory limits"],
            diagnosticCommands=[
                f"kubectl describe pod -l app={payload.serviceName}",
                f"kubectl top pod -l app={payload.serviceName}"
            ],
            recommendedRemediation=f"Increase container memory limit or scale replicas for {payload.serviceName}.",
            riskLevel="High",
            modelName="RuleBasedDiagnosticEngine"
        )

    return AIDiagnosisResponse(
        summary=f"Operational anomaly detected in service {payload.serviceName}.",
        probableRootCause=payload.triggerReason or "Unhandled Application Exception",
        confidenceLevel="Medium",
        supportingEvidence=payload.logsContext[:2] if payload.logsContext else ["Container status unhealthy"],
        alternativeExplanations=["Network latency spike"],
        diagnosticCommands=[f"kubectl logs deployment/{payload.serviceName} --tail=100"],
        recommendedRemediation=f"Inspect application logs and trigger rolling restart for {payload.serviceName}.",
        riskLevel="Medium",
        modelName="RuleBasedDiagnosticEngine"
    )
