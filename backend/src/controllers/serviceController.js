const { getAllServices, getServiceByName } = require('../services/incidentService');
const { getOverviewMetrics, getTimeSeriesMetrics } = require('../services/monitoringService');
const { getK8sClusterStatus } = require('../services/k8sService');

const getServices = async (req, res, next) => {
  try {
    const services = await getAllServices();
    res.status(200).json({ status: 'success', data: services });
  } catch (err) {
    next(err);
  }
};

const getService = async (req, res, next) => {
  try {
    const service = await getServiceByName(req.params.name);
    if (!service) {
      return res.status(404).json({ status: 'error', message: 'Service not found' });
    }
    res.status(200).json({ status: 'success', data: service });
  } catch (err) {
    next(err);
  }
};

const getDashboardOverview = async (req, res, next) => {
  try {
    const overview = await getOverviewMetrics();
    const services = await getAllServices();
    const timeSeries = await getTimeSeriesMetrics();
    const k8sStatus = await getK8sClusterStatus();

    res.status(200).json({
      status: 'success',
      data: {
        overview,
        services,
        timeSeries,
        k8sStatus
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getServices, getService, getDashboardOverview };
