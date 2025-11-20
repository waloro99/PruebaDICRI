const { poolPromise, sql } = require('../db/db.config');

//METODO LOGIN
async function login(userName, password) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('UserName', sql.NVarChar(50), userName)
    .input('Password', sql.NVarChar(255), password)
    .execute('sps_Auth_Login');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  // Datos generales del usuario
  const first = rows[0];

  const user = {
    userId: first.UserId,
    userName: first.UserName,
    firstName: first.FirstName,
    lastName: first.LastName,
    fullName: `${first.FirstName} ${first.LastName}`,
    email: first.Email,
    roles: []
  };

  // Lista de roles únicos
  const rolesSet = new Set();
  for (const row of rows) {
    if (row.NameRole) {
      rolesSet.add(row.NameRole);
    }
  }
  user.roles = Array.from(rolesSet);

  return user;
}

//METODO USUARIO PERFIL
async function getUserProfile(userId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('UserId', sql.Int, userId)
    .execute('sps_Auth_GetUserProfile');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  const first = rows[0];

  const user = {
    userId: first.UserId,
    userName: first.UserName,
    firstName: first.FirstName,
    lastName: first.LastName,
    fullName: `${first.FirstName} ${first.LastName}`,
    email: first.Email,
    roles: []
  };

  const rolesSet = new Set();
  for (const row of rows) {
    if (row.NameRole) {
      rolesSet.add(row.NameRole);
    }
  }
  user.roles = Array.from(rolesSet);

  return user;
}


module.exports = {
  login,
  getUserProfile
};

