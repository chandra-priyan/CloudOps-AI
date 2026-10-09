const { SIMULATION_SCENARIOS, triggerSimulation } = require('../services/simulationService');

const listScenarios = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: SIMULATION_SCENARIOS
  });
};

const runSimulation = async (req, res, next) => {
  try {
    const { scenarioId } = req.body;
    if (!scenarioId) {
      return res.status(400).json({ status: 'error', message: 'scenarioId is required' });
    }

    const result = await triggerSimulation(scenarioId);
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { listScenarios, runSimulation };
