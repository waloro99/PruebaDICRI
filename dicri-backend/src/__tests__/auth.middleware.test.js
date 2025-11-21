const { authenticate, authorize } = require('../middlewares/auth.middleware');
const jwt = require('jsonwebtoken');

// Mock del módulo jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('authenticate middleware', () => {
  test('retorna 401 si no se envía Authorization', () => {
    const req = { headers: {} };
    const res = createMockResponse();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token no proporcionado'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('retorna 401 si el formato del token es inválido', () => {
    const req = { headers: { authorization: 'TokenInvalido' } };
    const res = createMockResponse();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Formato de token inválido'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('retorna 401 si jwt.verify devuelve error', () => {
    const req = { headers: { authorization: 'Bearer abc.def.ghi' } };
    const res = createMockResponse();
    const next = jest.fn();

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(new Error('Token inválido'));
    });

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token inválido o expirado'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('coloca req.user y llama next si el token es válido', () => {
    const req = { headers: { authorization: 'Bearer valido' } };
    const res = createMockResponse();
    const next = jest.fn();

    const payload = {
      sub: 1,
      userName: 'admin',
      roles: ['ADMIN']
    };

    jwt.verify.mockImplementation((token, secret, callback) => {
      callback(null, payload);
    });

    authenticate(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();
    expect(req.user).toEqual({
      userId: payload.sub,
      userName: payload.userName,
      roles: payload.roles
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('authorize middleware', () => {
  test('retorna 401 si no hay req.user', () => {
    const req = {};
    const res = createMockResponse();
    const next = jest.fn();

    const middleware = authorize(['ADMIN']);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No autenticado'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('retorna 403 si el usuario no tiene el rol requerido', () => {
    const req = {
      user: {
        userId: 1,
        userName: 'user',
        roles: ['TECHNICIAN']
      }
    };
    const res = createMockResponse();
    const next = jest.fn();

    const middleware = authorize(['ADMIN']);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No tiene permisos para esta operación'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('llama next si el usuario tiene el rol requerido', () => {
    const req = {
      user: {
        userId: 1,
        userName: 'admin',
        roles: ['ADMIN', 'TECHNICIAN']
      }
    };
    const res = createMockResponse();
    const next = jest.fn();

    const middleware = authorize(['ADMIN']);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
