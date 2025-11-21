const { poolPromise, sql } = require('../db/db.config');

async function getAllUsers() {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .execute('sps_Users_GetAll');

  return result.recordset;
}

async function getUserById(userId) {
  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('UserId', sql.Int, userId)
    .execute('sps_Users_GetById');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  const base = rows[0];

  const roles = [];
  const rolesSet = new Set();

  for (const row of rows) {
    if (row.RoleId && !rolesSet.has(row.RoleId)) {
      rolesSet.add(row.RoleId);
      roles.push({
        roleId: row.RoleId,
        name: row.NameRole
      });
    }
  }

  // Devuelves UN SOLO objeto usuario con sus roles en un listado
  return {
    userId: base.UserId,
    firstName: base.FirstName,
    lastName: base.LastName,
    userName: base.UserName,
    email: base.Email,
    phoneNumber: base.PhoneNumber,
    roles
  };
}


async function createUser(data) {
  const {
    firstName,
    lastName,
    userName,
    email,
    phoneNumber,
    password,
    roleIds,
    tokenCreated
  } = data;

  const pool = await poolPromise;
  const request = pool.request()
    .input('FirstName', sql.NVarChar(100), firstName)
    .input('LastName', sql.NVarChar(100), lastName)
    .input('UserName', sql.NVarChar(50), userName)
    .input('Email', sql.NVarChar(150), email)
    .input('PhoneNumber', sql.NVarChar(20), phoneNumber || null)
    .input('Password', sql.NVarChar(255), password)
    .input('TokenCreated', sql.NVarChar(100), tokenCreated);

  if (Array.isArray(roleIds) && roleIds.length > 0) {
    const roleIdsString = roleIds.join(',');
    request.input('RoleIds', sql.NVarChar(sql.MAX), roleIdsString);
  } else {
    request.input('RoleIds', sql.NVarChar(sql.MAX), null);
  }

  const result = await request.execute('sps_Users_Insert');

  const rows = result.recordset;
  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function updateUser(data) {
  const {
    userId,
    firstName,
    lastName,
    userName,
    email,
    phoneNumber,
    password,
    roleIds,
    tokenUpdated
  } = data;

  const pool = await poolPromise;
  const request = pool.request()
    .input('UserId', sql.Int, userId)
    .input('FirstName', sql.NVarChar(100), firstName)
    .input('LastName', sql.NVarChar(100), lastName)
    .input('UserName', sql.NVarChar(50), userName)
    .input('Email', sql.NVarChar(150), email)
    .input('PhoneNumber', sql.NVarChar(20), phoneNumber || null)
    .input('Password', sql.NVarChar(255), password || null)
    .input('TokenUpdated', sql.NVarChar(100), tokenUpdated);

  // RoleIds: lista separada por comas o NULL
  if (Array.isArray(roleIds) && roleIds.length > 0) {
    const roleIdsString = roleIds.join(',');
    request.input('RoleIds', sql.NVarChar(sql.MAX), roleIdsString);
  } else {
    request.input('RoleIds', sql.NVarChar(sql.MAX), null);
  }

  const result = await request.execute('sps_Users_Update');

  const rows = result.recordset;
  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function updateUserStatus(data) {
  const { userId, isActive, tokenUpdated } = data;

  const pool = await poolPromise;

  const result = await pool
    .request()
    .input('UserId', sql.Int, userId)
    .input('IsActive', sql.Bit, isActive ? 1 : 0)
    .input('TokenUpdated', sql.NVarChar(100), tokenUpdated)
    .execute('sps_Users_UpdateStatus');

  const rows = result.recordset;

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0];
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus
};
