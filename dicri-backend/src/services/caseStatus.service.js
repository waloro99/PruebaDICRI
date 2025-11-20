const { poolPromise, sql } = require('../db/db.config');

async function getAllCaseStatuses() {
  const pool = await poolPromise;
  const result = await pool.request().execute('sps_Cat_CaseStatuses_GetAll');
  return result.recordset;
}

module.exports = {
  getAllCaseStatuses
};
