const { getIncidentById } = require('../services/incidentService');
const { requestDiagnosis } = require('../services/aiService');

const diagnoseIncident = async (req, res, next) => {
  try {
    const { incidentId } = req.body;
    if (!incidentId) {
      return res.status(400).json({ status: 'error', message: 'incidentId is required' });
    }

    const incident = await getIncidentById(incidentId);
    if (!incident) {
      return res.status(404).json({ status: 'error', message: `Incident '${incidentId}' not found` });
    }

    const diagnosis = await requestDiagnosis(incident);

    res.status(200).json({
      status: 'success',
      data: diagnosis
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { diagnoseIncident };
