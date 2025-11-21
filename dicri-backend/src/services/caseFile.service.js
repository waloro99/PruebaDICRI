const { poolPromise, sql } = require('../db/db.config');

async function createCaseFile(data) {
  const {
    caseNumber,
    descriptionCase,
    prosecutorOffice,
    createdByUserId,
    caseStatusId,
    observations,
    tokenCreated
  } = data;

  const pool = await poolPromise;
  const request = pool.request()
    .input('CaseNumber', sql.NVarChar(50), caseNumber)
    .input('DescriptionCase', sql.NVarChar(500), descriptionCase)
    .input('ProsecutorOffice', sql.NVarChar(150), prosecutorOffice || null)
    .input('CreatedByUserId', sql.Int, createdByUserId)
    .input('CaseStatusId', sql.Int, caseStatusId || null)
    .input('Observations', sql.NVarChar(500), observations || null)
    .input('TokenCreated', sql.NVarChar(100), tokenCreated);

  const result = await request.execute('sps_CaseFiles_Insert');

  const rows = result.recordset;
  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function getCaseFilesList(filters) {
  const {
    statusId,
    fromDate,
    toDate,
    createdByUserId
  } = filters;

  const pool = await poolPromise;
  const request = pool.request();

  // Filtros opcionales: si vienen, se envían; si no, se mandan como NULL
  if (statusId !== undefined && statusId !== null) {
    request.input('CaseStatusId', sql.Int, statusId);
  } else {
    request.input('CaseStatusId', sql.Int, null);
  }

  if (fromDate) {
    request.input('FromDate', sql.Date, fromDate);
  } else {
    request.input('FromDate', sql.Date, null);
  }

  if (toDate) {
    request.input('ToDate', sql.Date, toDate);
  } else {
    request.input('ToDate', sql.Date, null);
  }

  if (createdByUserId !== undefined && createdByUserId !== null) {
    request.input('CreatedByUserId', sql.Int, createdByUserId);
  } else {
    request.input('CreatedByUserId', sql.Int, null);
  }

  const result = await request.execute('sps_CaseFiles_GetList');

  return result.recordset;
}

async function getCaseFileById(caseFileId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('CaseFileId', sql.Int, caseFileId)
    .execute('sps_CaseFiles_GetById');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function sendCaseFileToReview(data) {
  const { caseFileId, changedByUserId, tokenUpdated } = data;

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('CaseFileId', sql.Int, caseFileId)
    .input('ChangedByUserId', sql.Int, changedByUserId)
    .input('TokenUpdated', sql.NVarChar(100), tokenUpdated)
    .execute('sps_CaseFiles_SendToReview');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function approveCaseFile(data) {
  const {
    caseFileId,
    approvedByUserId,
    tokenUpdated,
    approvalComment
  } = data;

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('CaseFileId', sql.Int, caseFileId)
    .input('ApprovedByUserId', sql.Int, approvedByUserId)
    .input('TokenUpdated', sql.NVarChar(100), tokenUpdated)
    .input('ApprovalComment', sql.NVarChar(500), approvalComment || null)
    .execute('sps_CaseFiles_Approve');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function rejectCaseFile(data) {
  const {
    caseFileId,
    rejectedByUserId,
    tokenUpdated,
    rejectionReason
  } = data;

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('CaseFileId', sql.Int, caseFileId)
    .input('RejectedByUserId', sql.Int, rejectedByUserId)
    .input('TokenUpdated', sql.NVarChar(100), tokenUpdated)
    .input('RejectionReason', sql.NVarChar(500), rejectionReason)
    .execute('sps_CaseFiles_Reject');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function updateCaseFile(data) {
  const {
    caseFileId,
    caseNumber,
    descriptionCase,
    prosecutorOffice,
    observations,
    updatedByUserId,
    tokenUpdated
  } = data;

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('CaseFileId', sql.Int, caseFileId)
    .input('CaseNumber', sql.NVarChar(50), caseNumber)
    .input('DescriptionCase', sql.NVarChar(500), descriptionCase)
    .input('ProsecutorOffice', sql.NVarChar(150), prosecutorOffice || null)
    .input('Observations', sql.NVarChar(500), observations || null)
    .input('UpdatedByUserId', sql.Int, updatedByUserId)
    .input('TokenUpdated', sql.NVarChar(100), tokenUpdated)
    .execute('sps_CaseFiles_Update');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function deleteCaseFile(data) {
  const { caseFileId, deletedByUserId, tokenUpdated } = data;

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('CaseFileId', sql.Int, caseFileId)
    .input('DeletedByUserId', sql.Int, deletedByUserId)
    .input('TokenUpdated', sql.NVarChar(100), tokenUpdated)
    .execute('sps_CaseFiles_DeleteLogical');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function getCaseFileHistory(caseFileId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('CaseFileId', sql.Int, caseFileId)
    .execute('sps_CaseFiles_GetHistory');

  // Si no hay historial, devolvemos []
  return result.recordset;
}

module.exports = {
  createCaseFile,
  getCaseFilesList,
  getCaseFileById,
  sendCaseFileToReview,
  approveCaseFile,
  rejectCaseFile,
  updateCaseFile,
  deleteCaseFile,
  getCaseFileHistory
};
