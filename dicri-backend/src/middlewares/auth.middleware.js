const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Formato de token inválido' });
  }

  const token = parts[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    // Normalizamos el usuario desde el payload
    req.user = {
      userId: payload.sub,
      userName: payload.userName,
      roles: payload.roles || []
    };

    next();
  });
}

module.exports = {
  authenticate
};
