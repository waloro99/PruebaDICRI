const caseStatusService = require('../services/caseStatus.service');

async function getCaseStatuses(req, res, next) {
  try {
    const statuses = await caseStatusService.getAllCaseStatuses();
    res.json(statuses);
  } catch (error) {
    next(error); // capturado en el errorHandler
  }
}

module.exports = {
  getCaseStatuses
};
