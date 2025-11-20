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

function authorize(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !Array.isArray(req.user.roles)) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ message: 'No tiene permisos para esta operación' });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize
};
