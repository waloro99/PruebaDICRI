const roleService = require('../services/role.service');

async function getRoles(req, res, next) {
  try {
    const roles = await roleService.getAllRoles();
    return res.json(roles);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRoles
};
