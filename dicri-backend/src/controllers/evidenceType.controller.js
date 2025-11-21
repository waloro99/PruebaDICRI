const evidenceTypeService = require('../services/evidenceType.service');

async function getEvidenceTypes(req, res, next) {
  try {
    const evidenceTypes = await evidenceTypeService.getAllEvidenceTypes();
    return res.json(evidenceTypes);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getEvidenceTypes
};
