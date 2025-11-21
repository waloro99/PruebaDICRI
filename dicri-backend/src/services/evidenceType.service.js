const { poolPromise, sql } = require('../db/db.config');

async function getAllEvidenceTypes() {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .execute('sps_Cat_EvidenceTypes_GetAll');

  return result.recordset;
}

module.exports = {
  getAllEvidenceTypes
};
