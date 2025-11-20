const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { userName, password } = req.body;

    if (!userName || !password) {
      return res.status(400).json({
        message: 'Debe proporcionar usuario y contraseña'
      });
    }

    const user = await authService.login(userName, password);

    if (!user) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    const payload = {
      sub: user.userId,
      userName: user.userName,
      roles: user.roles
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
      }
    );

    return res.json({
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const userId = req.user && req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    const user = await authService.getUserProfile(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(user);
  } catch (error) {
    next(error);
  }
}


module.exports = {
  login,
  me
};
