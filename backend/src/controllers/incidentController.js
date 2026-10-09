const { getIncidents, getIncidentById, createIncident, updateIncident } = require('../services/incidentService');
const { requestDiagnosis } = require('../services/aiService');

const listIncidents = async (req, res, next) => {
  try {
    const { service, status, severity, page, limit } = req.query;
    const result = await getIncidents({ service, status, severity, page, limit });
    res.status(200).json({ status: 'success', ...result });
  } catch (err) {
    next(err);
  }
};

const getIncident = async (req, res, next) => {
  try {
    const incident = await getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ status: 'error', message: 'Incident not found' });
    }
    res.status(200).json({ status: 'success', data: incident });
  } catch (err) {
    next(err);
  }
};

const createNewIncident = async (req, res, next) => {
  try {
    const { title, serviceName, severity, triggerReason, metricsContext, logsContext, k8sEventsContext } = req.body;
    if (!title || !serviceName || !triggerReason) {
      return res.status(400).json({ status: 'error', message: 'title, serviceName, and triggerReason are required' });
    }

    const incident = await createIncident({
      title,
      serviceName,
      severity: severity || 'High',
      triggerReason,
      metricsContext,
      logsContext,
      k8sEventsContext
    });

    res.status(201).json({ status: 'success', data: incident });
  } catch (err) {
    next(err);
  }
};

const updateIncidentStatus = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (status === 'Resolved') update.resolvedAt = new Date();

    const incident = await updateIncident(req.params.id, update);
    if (!incident) {
      return res.status(404).json({ status: 'error', message: 'Incident not found' });
    }

    res.status(200).json({ status: 'success', data: incident });
  } catch (err) {
    next(err);
  }
};

const addIncidentNote = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ status: 'error', message: 'Note content required' });
    }

    const incident = await getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ status: 'error', message: 'Incident not found' });
    }

    const newNote = {
      author: req.user?.email || 'DevOps Engineer',
      content,
      createdAt: new Date()
    };

    const updatedNotes = [...(incident.notes || []), newNote];
    const updated = await updateIncident(req.params.id, { notes: updatedNotes });

    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listIncidents,
  getIncident,
  createNewIncident,
  updateIncidentStatus,
  addIncidentNote
};
