const caseFileController = require('../controllers/caseFile.controller');

// Mock del service y del helper de tokens
jest.mock('../services/caseFile.service', () => ({
  createCaseFile: jest.fn()
}));

jest.mock('../utils/auditToken.util', () => ({
  generateAuditToken: jest.fn(() => 'test-token-created')
}));

const caseFileService = require('../services/caseFile.service');
const { generateAuditToken } = require('../utils/auditToken.util');

function createMockResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('caseFile.controller - createCaseFile', () => {
  test('retorna 400 si faltan campos obligatorios', async () => {
    const req = {
      body: {
        // falta caseNumber
        descriptionCase: 'Caso de prueba'
      },
      user: {
        userId: 1
      }
    };
    const res = createMockResponse();
    const next = jest.fn();

    await caseFileController.createCaseFile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Numero de caso y descripcion son obligatorios'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('retorna 401 si no hay usuario autenticado', async () => {
    const req = {
      body: {
        caseNumber: 'DICRI-2025-0001',
        descriptionCase: 'Caso de prueba'
      },
      user: null
    };
    const res = createMockResponse();
    const next = jest.fn();

    await caseFileController.createCaseFile(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No autenticado'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('retorna 201 y llama al service con los datos correctos', async () => {
    const req = {
      body: {
        caseNumber: 'DICRI-2025-0001',
        descriptionCase: 'Homicidio en zona 1',
        prosecutorOffice: 'Fiscalía Metropolitana',
        caseStatusId: null,
        observations: 'Creado desde pruebas unitarias'
      },
      user: {
        userId: 3
      }
    };
    const res = createMockResponse();
    const next = jest.fn();

    const fakeCaseFile = {
      CaseFileId: 10,
      CaseNumber: 'DICRI-2025-0001',
      DescriptionCase: 'Homicidio en zona 1'
    };

    caseFileService.createCaseFile.mockResolvedValueOnce(fakeCaseFile);

    await caseFileController.createCaseFile(req, res, next);

    expect(generateAuditToken).toHaveBeenCalled();

    expect(caseFileService.createCaseFile).toHaveBeenCalledWith({
      caseNumber: 'DICRI-2025-0001',
      descriptionCase: 'Homicidio en zona 1',
      prosecutorOffice: 'Fiscalía Metropolitana',
      createdByUserId: 3,
      caseStatusId: null,
      observations: 'Creado desde pruebas unitarias',
      tokenCreated: 'test-token-created'
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeCaseFile);
    expect(next).not.toHaveBeenCalled();
  });
});
