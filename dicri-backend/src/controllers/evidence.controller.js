const evidenceService = require('../services/evidence.service');
const { generateAuditToken } = require('../utils/auditToken.util');

async function createEvidenceForCaseFile(req, res, next) {
  try {
    const caseFileId = parseInt(req.params.caseFileId, 10);
    if (Number.isNaN(caseFileId)) {
      return res.status(400).json({ message: 'Id de expediente inválido' });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const {
      evidenceCode,
      descriptionEvidence,
      evidenceTypeId,
      color,
      sizeDescription,
      weightDescription,
      foundLocation,
      currentLocation,
      observations
    } = req.body;

    if (!evidenceCode || !descriptionEvidence || !evidenceTypeId) {
      return res.status(400).json({
        message: 'Codigo de indicio, descripcion y tipo son obligatorios'
      });
    }

    const tokenCreated = generateAuditToken();

    const newEvidence = await evidenceService.createEvidence({
      caseFileId,
      evidenceCode,
      descriptionEvidence,
      evidenceTypeId,
      color,
      sizeDescription,
      weightDescription,
      foundLocation,
      currentLocation,
      createdByUserId: req.user.userId,
      observations,
      tokenCreated
    });

    if (!newEvidence) {
      return res.status(500).json({
        message: 'No se pudo crear la evidencia'
      });
    }

    return res.status(201).json(newEvidence);
  } catch (error) {
    next(error);
  }
}

async function getEvidencesForCaseFile(req, res, next) {
  try {
    const caseFileId = parseInt(req.params.caseFileId, 10);
    if (Number.isNaN(caseFileId)) {
      return res.status(400).json({ message: 'Id de expediente inválido' });
    }

    const evidences = await evidenceService.getEvidencesByCaseFileId(caseFileId);

    return res.json(evidences);
  } catch (error) {
    next(error);
  }
}

async function getEvidenceById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id de evidencia inválido' });
    }

    const evidence = await evidenceService.getEvidenceById(id);

    if (!evidence) {
      return res.status(404).json({ message: 'Evidencia no encontrada' });
    }

    return res.json(evidence);
  } catch (error) {
    next(error);
  }
}

async function updateEvidence(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id de evidencia inválido' });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const {
      evidenceCode,
      descriptionEvidence,
      evidenceTypeId,
      color,
      sizeDescription,
      weightDescription,
      foundLocation,
      currentLocation,
      observations
    } = req.body;

    if (!evidenceCode || !descriptionEvidence || !evidenceTypeId) {
      return res.status(400).json({
        message: 'Codigo de indicio, descripcion y tipo son obligatorios'
      });
    }

    const tokenUpdated = generateAuditToken();

    const updatedEvidence = await evidenceService.updateEvidence({
      evidenceId: id,
      evidenceCode,
      descriptionEvidence,
      evidenceTypeId,
      color,
      sizeDescription,
      weightDescription,
      foundLocation,
      currentLocation,
      observations,
      updatedByUserId: req.user.userId,
      tokenUpdated
    });

    if (!updatedEvidence) {
      return res.status(404).json({ message: 'Evidencia no encontrada' });
    }

    return res.json(updatedEvidence);
  } catch (error) {
    next(error);
  }
}

async function deleteEvidence(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id de evidencia inválido' });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const tokenUpdated = generateAuditToken();

    const deletedEvidence = await evidenceService.deleteEvidence({
      evidenceId: id,
      deletedByUserId: req.user.userId,
      tokenUpdated
    });

    if (!deletedEvidence) {
      return res.status(404).json({ message: 'Evidencia no encontrada' });
    }

    return res.json(deletedEvidence);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createEvidenceForCaseFile,
  getEvidencesForCaseFile,
  getEvidenceById,
  updateEvidence,
  deleteEvidence
};
