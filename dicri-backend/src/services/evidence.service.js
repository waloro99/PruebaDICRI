const { poolPromise, sql } = require('../db/db.config');

async function createEvidence(data) {
  const {
    caseFileId,
    evidenceCode,
    descriptionEvidence,
    evidenceTypeId,
    color,
    sizeDescription,
    weightDescription,
    foundLocation,
    currentLocation,
    createdByUserId,
    observations,
    tokenCreated
  } = data;

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('CaseFileId', sql.Int, caseFileId)
    .input('EvidenceCode', sql.NVarChar(50), evidenceCode)
    .input('DescriptionEvidence', sql.NVarChar(500), descriptionEvidence)
    .input('EvidenceTypeId', sql.Int, evidenceTypeId)
    .input('Color', sql.NVarChar(50), color || null)
    .input('SizeDescription', sql.NVarChar(100), sizeDescription || null)
    .input('WeightDescription', sql.Decimal(10, 3), weightDescription != null ? weightDescription : null)
    .input('FoundLocation', sql.NVarChar(200), foundLocation || null)
    .input('CurrentLocation', sql.NVarChar(200), currentLocation || null)
    .input('CreatedByUserId', sql.Int, createdByUserId)
    .input('Observations', sql.NVarChar(500), observations || null)
    .input('TokenCreated', sql.NVarChar(100), tokenCreated)
    .execute('sps_Evidence_Insert');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function getEvidencesByCaseFileId(caseFileId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('CaseFileId', sql.Int, caseFileId)
    .execute('sps_Evidence_GetByCaseFileId');

  return result.recordset;
}

async function getEvidenceById(evidenceId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('EvidenceId', sql.Int, evidenceId)
    .execute('sps_Evidence_GetById');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function updateEvidence(data) {
  const {
    evidenceId,
    evidenceCode,
    descriptionEvidence,
    evidenceTypeId,
    color,
    sizeDescription,
    weightDescription,
    foundLocation,
    currentLocation,
    observations,
    updatedByUserId,
    tokenUpdated
  } = data;

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('EvidenceId', sql.Int, evidenceId)
    .input('EvidenceCode', sql.NVarChar(50), evidenceCode)
    .input('DescriptionEvidence', sql.NVarChar(500), descriptionEvidence)
    .input('EvidenceTypeId', sql.Int, evidenceTypeId)
    .input('Color', sql.NVarChar(50), color || null)
    .input('SizeDescription', sql.NVarChar(100), sizeDescription || null)
    .input(
      'WeightDescription',
      sql.Decimal(10, 3),
      weightDescription != null ? weightDescription : null
    )
    .input('FoundLocation', sql.NVarChar(200), foundLocation || null)
    .input('CurrentLocation', sql.NVarChar(200), currentLocation || null)
    .input('Observations', sql.NVarChar(500), observations || null)
    .input('UpdatedByUserId', sql.Int, updatedByUserId)
    .input('TokenUpdated', sql.NVarChar(100), tokenUpdated)
    .execute('sps_Evidence_Update');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function deleteEvidence(data) {
  const { evidenceId, deletedByUserId, tokenUpdated } = data;

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('EvidenceId', sql.Int, evidenceId)
    .input('DeletedByUserId', sql.Int, deletedByUserId)
    .input('TokenUpdated', sql.NVarChar(100), tokenUpdated)
    .execute('sps_Evidence_DeleteLogical');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

module.exports = {
  createEvidence,
  getEvidencesByCaseFileId,
  getEvidenceById,
  updateEvidence,
  deleteEvidence
};
