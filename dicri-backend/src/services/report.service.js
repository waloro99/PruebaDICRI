const { poolPromise, sql } = require('../db/db.config');

async function getCaseFilesSummary(filters) {
  const { fromDate, toDate, statusId, createdByUserId } = filters;

  const pool = await poolPromise;
  const request = pool.request();

  request.input('FromDate', sql.Date, fromDate || null);
  request.input('ToDate', sql.Date, toDate || null);

  if (statusId !== undefined && statusId !== null) {
    request.input('CaseStatusId', sql.Int, statusId);
  } else {
    request.input('CaseStatusId', sql.Int, null);
  }

  if (createdByUserId !== undefined && createdByUserId !== null) {
    request.input('CreatedByUserId', sql.Int, createdByUserId);
  }

  const result = await request.execute('sps_Reports_CaseFilesSummary');

  const summaryRow =
    result.recordsets &&
    result.recordsets[0] &&
    result.recordsets[0][0]
      ? result.recordsets[0][0]
      : { TotalCaseFiles: 0 };

  const byStatusRows =
    result.recordsets && result.recordsets[1]
      ? result.recordsets[1]
      : [];

  return {
    totalCaseFiles: summaryRow.TotalCaseFiles || 0,
    byStatus: byStatusRows.map(row => ({
      caseStatusId: row.CaseStatusId,
      name: row.NameCaseStatus,
      count: row.CountCaseFiles
    }))
  };
}

async function getCaseFilesDetail(filters) {
  const {
    fromDate,
    toDate,
    statusId,
    createdByUserId
  } = filters;

  const pool = await poolPromise;
  const request = pool.request();

  request.input('FromDate', sql.Date, fromDate || null);
  request.input('ToDate', sql.Date, toDate || null);

  if (statusId !== undefined && statusId !== null) {
    request.input('CaseStatusId', sql.Int, statusId);
  } else {
    request.input('CaseStatusId', sql.Int, null);
  }

  if (createdByUserId !== undefined && createdByUserId !== null) {
    request.input('CreatedByUserId', sql.Int, createdByUserId);
  } else {
    request.input('CreatedByUserId', sql.Int, null);
  }

  const result = await request.execute('sps_Reports_CaseFilesDetail');

  return result.recordset;
}

module.exports = {
  getCaseFilesSummary,
  getCaseFilesDetail
};
