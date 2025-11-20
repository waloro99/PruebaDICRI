const caseFileService = require('../services/caseFile.service');
const { generateAuditToken } = require('../utils/auditToken.util');

async function createCaseFile(req, res, next) {
  try {
    const {
      caseNumber,
      descriptionCase,
      prosecutorOffice,
      caseStatusId,
      observations
    } = req.body;

    if (!caseNumber || !descriptionCase) {
      return res.status(400).json({
        message: 'Numero de caso y descripcion son obligatorios'
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const createdByUserId = req.user.userId;
    const tokenCreated = generateAuditToken();

    const newCaseFile = await caseFileService.createCaseFile({
      caseNumber,
      descriptionCase,
      prosecutorOffice,
      createdByUserId,
      caseStatusId: caseStatusId || null,
      observations,
      tokenCreated
    });

    if (!newCaseFile) {
      return res.status(500).json({
        message: 'No se pudo crear el expediente'
      });
    }

    return res.status(201).json(newCaseFile);
  } catch (error) {
    next(error);
  }
}

async function getCaseFiles(req, res, next) {
  try {
    const {
      statusId,
      fromDate,
      toDate,
      createdByUserId
    } = req.query;

    let statusIdInt = null;
    let createdByUserIdInt = null;

    if (statusId !== undefined) {
      const parsed = parseInt(statusId, 10);
      if (Number.isNaN(parsed)) {
        return res.status(400).json({ message: 'El estado debe ser numérico' });
      }
      statusIdInt = parsed;
    }

    if (createdByUserId !== undefined) {
      const parsed = parseInt(createdByUserId, 10);
      if (Number.isNaN(parsed)) {
        return res.status(400).json({ message: 'El usuario debe ser numérico' });
      }
      createdByUserIdInt = parsed;
    }

    const caseFiles = await caseFileService.getCaseFilesList({
      statusId: statusIdInt,
      fromDate: fromDate || null,
      toDate: toDate || null,
      createdByUserId: createdByUserIdInt
    });

    return res.json(caseFiles);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCaseFile,
  getCaseFiles
};
