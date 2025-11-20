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

module.exports = {
  createCaseFile,
  getCaseFilesList,
  getCaseFileById
};
