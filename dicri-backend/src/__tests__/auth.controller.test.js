const authController = require('../controllers/auth.controller');

// Mock de auth.service y jsonwebtoken
jest.mock('../services/auth.service', () => ({
  login: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'fake-jwt-token')
}));

const authService = require('../services/auth.service');

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('auth.controller - login', () => {
  test('retorna 400 si faltan userName o password', async () => {
    const req = {
      body: {
        userName: 'admin'
        // falta password
      }
    };
    const res = createMockResponse();
    const next = jest.fn();

    await authController.login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Debe proporcionar usuario y contraseña'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('retorna 401 si las credenciales son inválidas', async () => {
    const req = {
      body: {
        userName: 'admin',
        password: 'wrong'
      }
    };
    const res = createMockResponse();
    const next = jest.fn();

    authService.login.mockResolvedValueOnce(null);

    await authController.login(req, res, next);

    expect(authService.login).toHaveBeenCalledWith('admin', 'wrong');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Credenciales inválidas'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('retorna 200 con token y usuario si el login es correcto', async () => {
    const req = {
      body: {
        userName: 'admin',
        password: 'Admin123!'
      }
    };
    const res = createMockResponse();
    const next = jest.fn();

    const fakeUser = {
      userId: 1,
      userName: 'admin',
      firstName: 'Admin',
      lastName: 'Sistema',
      email: 'admin@dicri.gob',
      roles: ['ADMIN']
    };

    authService.login.mockResolvedValueOnce(fakeUser);

    await authController.login(req, res, next);

    expect(authService.login).toHaveBeenCalledWith('admin', 'Admin123!');
    expect(res.status).not.toHaveBeenCalled(); // usa 200 por defecto
    expect(res.json).toHaveBeenCalledWith({
      token: 'fake-jwt-token',
      user: fakeUser
    });
    expect(next).not.toHaveBeenCalled();
  });
});
