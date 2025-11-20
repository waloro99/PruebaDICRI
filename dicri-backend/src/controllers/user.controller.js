const userService = require('../services/user.service');
const { generateAuditToken } = require('../utils/auditToken.util');

async function getUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    return res.json(users);
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id de usuario inválido' });
    }

    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(user);
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const {
      firstName,
      lastName,
      userName,
      email,
      phoneNumber,
      password,
      roleIds
    } = req.body;

    if (!firstName || !lastName || !userName || !email || !password) {
      return res.status(400).json({
        message: 'Nombre, apellido, userName, correo y contraseña son obligatorios'
      });
    }

    const tokenCreated = generateAuditToken();

    const newUser = await userService.createUser({
      firstName,
      lastName,
      userName,
      email,
      phoneNumber,
      password,
      roleIds,
      tokenCreated
    });

    if (!newUser) {
      return res.status(500).json({
        message: 'No se pudo crear el usuario'
      });
    }

    return res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id de usuario inválido' });
    }

    const {
      firstName,
      lastName,
      userName,
      email,
      phoneNumber,
      password,
      roleIds
    } = req.body;

    if (!firstName || !lastName || !userName || !email) {
      return res.status(400).json({
        message: 'Nombre, apellido, userName y correo son obligatorios'
      });
    }

    const tokenUpdated = generateAuditToken();

    const updatedUser = await userService.updateUser({
      userId: id,
      firstName,
      lastName,
      userName,
      email,
      phoneNumber,
      password: password || null,
      roleIds,
      tokenUpdated
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(updatedUser);
  } catch (error) {
    next(error);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Id de usuario inválido' });
    }

    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        message: 'El campo isActive es obligatorio'
      });
    }

    const tokenUpdated = generateAuditToken();

    const updatedUser = await userService.updateUserStatus({
      userId: id,
      isActive,
      tokenUpdated
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(updatedUser);
  } catch (error) {
    next(error);
  }
}


module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus
};
