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
      createdByUserId,
      page,
      pageSize
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
      createdByUserId: createdByUserIdInt,
      page: page,
      pageSize: pageSize
    });

    return res.json(caseFiles);
  } catch (error) {
    next(error);
  }
}

async function getCaseFileById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id de expediente inválido' });
    }

    const caseFile = await caseFileService.getCaseFileById(id);

    if (!caseFile) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    return res.json(caseFile);
  } catch (error) {
    next(error);
  }
}

async function sendToReview(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id de expediente inválido' });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const changedByUserId = req.user.userId;
    const tokenUpdated = generateAuditToken();

    const updatedCaseFile = await caseFileService.sendCaseFileToReview({
      caseFileId: id,
      changedByUserId,
      tokenUpdated
    });

    if (!updatedCaseFile) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    return res.json(updatedCaseFile);
  } catch (error) {
    next(error);
  }
}

async function approveCaseFile(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id de expediente inválido' });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { approvalComment } = req.body || {};

    const tokenUpdated = generateAuditToken();

    const updatedCaseFile = await caseFileService.approveCaseFile({
      caseFileId: id,
      approvedByUserId: req.user.userId,
      tokenUpdated,
      approvalComment
    });

    if (!updatedCaseFile) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    return res.json(updatedCaseFile);
  } catch (error) {
    next(error);
  }
}

async function rejectCaseFile(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id de expediente inválido' });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const { rejectionReason } = req.body || {};

    if (!rejectionReason || typeof rejectionReason !== 'string' || !rejectionReason.trim()) {
      return res.status(400).json({
        message: 'Es obligatorio una razón de rechazo válida'
      });
    }

    const tokenUpdated = generateAuditToken();

    const updatedCaseFile = await caseFileService.rejectCaseFile({
      caseFileId: id,
      rejectedByUserId: req.user.userId,
      tokenUpdated,
      rejectionReason: rejectionReason.trim()
    });

    if (!updatedCaseFile) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    return res.json(updatedCaseFile);
  } catch (error) {
    next(error);
  }
}

async function updateCaseFile(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id de expediente inválido' });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const {
      caseNumber,
      descriptionCase,
      prosecutorOffice,
      observations
    } = req.body;

    if (!caseNumber || !descriptionCase) {
      return res.status(400).json({
        message: 'Numero de caso y descripcion son obligatorios'
      });
    }

    const tokenUpdated = generateAuditToken();

    const updatedCaseFile = await caseFileService.updateCaseFile({
      caseFileId: id,
      caseNumber,
      descriptionCase,
      prosecutorOffice,
      observations,
      updatedByUserId: req.user.userId,
      tokenUpdated
    });

    if (!updatedCaseFile) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    return res.json(updatedCaseFile);
  } catch (error) {
    next(error);
  }
}

async function deleteCaseFile(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id de expediente inválido' });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const tokenUpdated = generateAuditToken();

    const deletedCaseFile = await caseFileService.deleteCaseFile({
      caseFileId: id,
      deletedByUserId: req.user.userId,
      tokenUpdated
    });

    if (!deletedCaseFile) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    return res.json(deletedCaseFile);
  } catch (error) {
    next(error);
  }
}

async function getCaseFileHistory(req, res, next) {
  try {
    const caseFileId = parseInt(req.params.caseFileId, 10);
    if (Number.isNaN(caseFileId)) {
      return res.status(400).json({ message: 'Id de expediente inválido' });
    }

    const history = await caseFileService.getCaseFileHistory(caseFileId);

    return res.json(history);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCaseFile,
  getCaseFiles,
  getCaseFileById,
  sendToReview,
  approveCaseFile,
  rejectCaseFile,
  updateCaseFile,
  deleteCaseFile,
  getCaseFileHistory
};
