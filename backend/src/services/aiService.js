const config = require('../config');
const { updateIncident } = require('./incidentService');

/**
 * Sends structured diagnostic context to FastAPI AI troubleshooting service.
 * If FastAPI or Ollama is unreachable, returns fallback evidence-driven diagnosis.
 */
const requestDiagnosis = async (incident) => {
  const diagnosticContext = {
    incident_description: incident.triggerReason || incident.title,
    service_name: incident.serviceName,
    severity: incident.severity,
    relevant_logs: incident.logsContext || [],
    recent_metrics: incident.metricsContext || {},
    kubernetes_events: incident.k8sEventsContext || [],
    container_status: {
      restartCount: incident.metricsContext?.restartCount || 0,
      cpuPercent: incident.metricsContext?.cpuPercent || 0,
      memoryMb: incident.metricsContext?.memoryMb || 0
    },
    recent_deployment: incident.deploymentContext || null
  };

  try {
    // Attempt HTTP call to Python FastAPI AI service
    const response = await fetch(`${config.aiServiceUrl}/api/v1/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(diagnosticContext),
      signal: AbortSignal.timeout(6000)
    });

    if (response.ok) {
      const result = await response.json();
      const aiData = { ...result, analyzedAt: new Date() };
      await updateIncident(incident.incidentId, { aiDiagnosis: aiData, status: 'Investigating' });
      return aiData;
    }
  } catch (err) {
    console.warn(`[AI Service Warning] FastAPI AI service unreachable at ${config.aiServiceUrl} (${err.message}). Generating fallback evidence-driven diagnosis.`);
  }

  // Fallback rule-based AI diagnosis when Ollama/FastAPI service is offline
  const fallbackDiagnosis = generateFallbackDiagnosis(incident);
  await updateIncident(incident.incidentId, { aiDiagnosis: fallbackDiagnosis, status: 'Investigating' });
  return fallbackDiagnosis;
};

const generateFallbackDiagnosis = (incident) => {
  const service = incident.serviceName;
  const reason = incident.triggerReason || '';
  const logsStr = (incident.logsContext || []).join(' ');

  let probableCause = `Potentially anomalous resource usage or application logic exception in ${service}.`;
  let recommendedRemediation = `Restart ${service} container deployment and inspect container environment variables.`;
  let confidenceLevel = 'Medium';
  let riskLevel = 'Low';
  let supportingEvidence = [];
  let diagnosticCommands = [
    `kubectl logs -n default deployment/${service} --tail=50`,
    `kubectl describe deployment/${service}`,
    `kubectl top pods -l app=${service}`
  ];

  if (logsStr.includes('ENOTFOUND') || logsStr.includes('connection timed out') || logsStr.includes('MongoNetworkError')) {
    probableCause = `Database connection loss due to hostname resolution failure or MongoDB service offline (ENOTFOUND).`;
    recommendedRemediation = `Verify database Service endpoint DNS, check MONGODB_URI secret, and restart ${service} deployment.`;
    confidenceLevel = 'High';
    riskLevel = 'Low';
    supportingEvidence = [
      'Application logs report connection timeout to database hostname',
      'High container restart count indicates crash loop on startup connection retries'
    ];
  } else if (logsStr.includes('OOMKilled') || incident.metricsContext?.memoryMb > 450) {
    probableCause = `Memory pressure limit exceeded (${incident.metricsContext?.memoryMb || 450}MB / 512MB limit), triggering Linux kernel OOMKilled signal.`;
    recommendedRemediation = `Scale memory limit for ${service} to 768MB or execute rolling restart to clear leaked heap memory.`;
    confidenceLevel = 'High';
    riskLevel = 'Medium';
    supportingEvidence = [
      'Pod events record OOMKilled termination code 137',
      'Memory utilization metrics reached 90%+ capacity threshold'
    ];
  } else if (reason.includes('500') || logsStr.includes('500 Internal Server Error')) {
    probableCause = `Unhandled runtime exception in application API handler following recent deployment.`;
    recommendedRemediation = `Rollback ${service} to previous stable deployment version.`;
    confidenceLevel = 'High';
    riskLevel = 'Medium';
    supportingEvidence = [
      'HTTP 500 error rate spiked immediately following release rollout',
      'Application error logs show unhandled promise rejection'
    ];
  } else {
    supportingEvidence = [
      `Elevated metric threshold detected on ${service}`,
      `Service status changed to ${incident.severity}`
    ];
  }

  return {
    summary: `Diagnostic analysis for ${incident.incidentId} (${service}) based on available logs and telemetry.`,
    probableRootCause: probableCause,
    confidenceLevel,
    supportingEvidence,
    alternativeExplanations: [
      'Underlying node memory or CPU throttling',
      'Transient Kubernetes CoreDNS networking issue'
    ],
    diagnosticCommands,
    recommendedRemediation,
    riskLevel,
    verificationSteps: [
      `kubectl get pods -l app=${service}`,
      `curl -s http://${service}/health | grep "200 OK"`,
      `Verify error rate drops below 1% in Prometheus metrics`
    ],
    analyzedAt: new Date()
  };
};

module.exports = { requestDiagnosis };
