const { poolPromise, sql } = require('../db/db.config');

async function getAllRoles() {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .execute('sps_Roles_GetAll');

  return result.recordset;
}

module.exports = {
  getAllRoles
};
