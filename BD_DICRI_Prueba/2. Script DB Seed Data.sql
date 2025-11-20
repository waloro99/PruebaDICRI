USE DICRI_Prueba;
GO

/*============================================================
  1. ROLES
============================================================*/
INSERT INTO dbo.Roles (NameRole, DescriptionRole, TokenCreated, DateCreated)
VALUES
('ADMIN',        N'Administrador del sistema',	'seed-role-1',  '2025-01-01T09:00:00'),
('COORDINATOR',  N'Coordinador de expedientes',	'seed-role-2',  '2025-01-01T09:05:00'),
('TECHNICIAN',   N'Técnico registrador de evidencias',	'seed-role-3',  '2025-01-01T09:10:00');
GO

/*============================================================
  2. USERS
============================================================*/
INSERT INTO dbo.Users
    (FirstName, LastName, UserName, Email, PhoneNumber, PasswordUser, TokenCreated, DateCreated)
VALUES
(N'Juan',     N'Pérez',     'jperez',     'juan.perez@dicri.gob.gt',    N'+50255510001', 'P@ssw0rd1',  'seed-user-1',  '2025-01-02T08:00:00'),
(N'María',    N'López',     'mlopez',     'maria.lopez@dicri.gob.gt',   N'+50255510002', 'P@ssw0rd2',  'seed-user-2',  '2025-01-02T08:05:00'),
(N'Carlos',   N'Ramírez',   'cramirez',   'carlos.ramirez@dicri.gob.gt','+50255510003', 'P@ssw0rd3',  'seed-user-3',  '2025-01-02T08:10:00'),
(N'Ana',      N'González',  'agonzalez',  'ana.gonzalez@dicri.gob.gt',  N'+50255510004', 'P@ssw0rd4',  'seed-user-4',  '2025-01-02T08:15:00'),
(N'Luis',     N'Hernández', 'lhernandez', 'luis.hernandez@dicri.gob.gt',N'+50255510005','P@ssw0rd5',  'seed-user-5',  '2025-01-02T08:20:00'),
(N'Sofía',    N'Martínez',  'smartinez',  'sofia.martinez@dicri.gob.gt',N'+50255510006','P@ssw0rd6',  'seed-user-6',  '2025-01-02T08:25:00'),
(N'Diego',    N'Castillo',  'dcastillo',  'diego.castillo@dicri.gob.gt',N'+50255510007','P@ssw0rd7',  'seed-user-7',  '2025-01-02T08:30:00'),
(N'Laura',    N'Ríos',      'lrios',      'laura.rios@dicri.gob.gt',    N'+50255510008','P@ssw0rd8',  'seed-user-8',  '2025-01-02T08:35:00'),
(N'Pedro',    N'Méndez',    'pmendez',    'pedro.mendez@dicri.gob.gt',  N'+50255510009','P@ssw0rd9',  'seed-user-9',  '2025-01-02T08:40:00'),
(N'Gabriela', N'Sosa',      'gsosa',      'gabriela.sosa@dicri.gob.gt', N'+50255510010','P@ssw0rd10', 'seed-user-10', '2025-01-02T08:45:00');
GO

/*============================================================
  3. CATÁLOGO ESTADOS DE EXPEDIENTE
============================================================*/
INSERT INTO dbo.Cat_CaseStatuses
    (NameCaseStatus, DescriptionCaseStatus, TokenCreated, DateCreated)
VALUES
('REGISTRADO',	N'Expediente registrado por el técnico',	'seed-status-1',  '2025-01-03T09:00:00'),
('EN REVISIÓN',	N'Expediente en revisión por el coordinador',	'seed-status-2',  '2025-01-03T09:05:00'),
('APROBADO',	N'Expediente aprobado por el coordinador',	'seed-status-3',  '2025-01-03T09:10:00'),
('RECHAZADO',	N'Expediente rechazado por inconsistencias',	'seed-status-4',  '2025-01-03T09:15:00'),
('CERRADO',	N'Expediente finalizado y cerrado',	'seed-status-5',  '2025-01-03T09:20:00'),
('REAPERTURA',	N'Expediente reabierto para nueva revisión',	'seed-status-6',  '2025-01-03T09:25:00'),
('EN ESPERA',	N'Expediente en espera de información adicional',	'seed-status-7',  '2025-01-03T09:30:00'),
('ARCHIVADO',	N'Expediente archivado físicamente',	'seed-status-8',  '2025-01-03T09:35:00'),
('CANCELADO',	N'Expediente cancelado por orden judicial',	'seed-status-9',  '2025-01-03T09:40:00');
GO

/*============================================================
  4. CATÁLOGO TIPOS DE EVIDENCIA
============================================================*/
INSERT INTO dbo.Cat_EvidenceTypes
    (NameEvidenceType, DescriptionEvidenceType, TokenCreated, DateCreated)
VALUES
('ARMA DE FUEGO',   N'Armas de fuego incautadas',	'seed-etype-1',  '2025-01-04T10:00:00'),
('MUNICIÓN',	N'Municiones asociadas a armas de fuego',	'seed-etype-2',  '2025-01-04T10:05:00'),
('DOCUMENTO',	N'Documentos físicos como cartas, contratos, etc.',	'seed-etype-3',  '2025-01-04T10:10:00'),
('ROPA',	N'Prendas de vestir relacionadas con el caso',	'seed-etype-4',  '2025-01-04T10:15:00'),
('DISPOSITIVO ELECTRÓNICO',N'Celulares, laptops u otros dispositivos electrónicos',    'seed-etype-5',  '2025-01-04T10:20:00'),
('PIEZA DE VEHÍCULO',	N'Partes de vehículos involucrados',	'seed-etype-6',  '2025-01-04T10:25:00'),
('HERRAMIENTA',	N'Herramientas utilizadas en el hecho',	'seed-etype-7',  '2025-01-04T10:30:00'),
('OTROS',	N'Otros objetos varios relacionados',	'seed-etype-8', '2025-01-04T10:45:00');
GO

/*============================================================
  5. USER ROLE (RELACIÓN USUARIO–ROL)
============================================================*/
INSERT INTO dbo.UserRole
    (UserId, RoleId, TokenCreated, DateCreated)
VALUES
(1,  1, 'seed-urole-1',  '2025-01-05T08:00:00'), -- Juan - ADMIN
(2,  2, 'seed-urole-2',  '2025-01-05T08:05:00'), -- María - COORDINATOR
(3,  3, 'seed-urole-3',  '2025-01-05T08:10:00'), -- Carlos - TECHNICIAN
(4,  3, 'seed-urole-4',  '2025-01-05T08:15:00'), -- Ana - TECHNICIAN
(5,  3, 'seed-urole-5',  '2025-01-05T08:20:00'), -- Luis - TECHNICIAN
(6,  3, 'seed-urole-6',  '2025-01-05T08:25:00'), -- Sofía - TECHNICIAN
(7,  2, 'seed-urole-7',  '2025-01-05T08:30:00'), -- Diego - COORDINATOR
(8,  1, 'seed-urole-8',  '2025-01-05T08:35:00'), -- Laura - ADMIN
(9,  2, 'seed-urole-9',  '2025-01-05T08:40:00'), -- Pedro - COORDINATOR
(10, 3, 'seed-urole-10', '2025-01-05T08:45:00'); -- Gabriela - TECHNICIAN
GO

/*============================================================
  6. EXPEDIENTES
============================================================*/
INSERT INTO dbo.CaseFiles
    (CaseNumber, DescriptionCase, ProsecutorOffice, CreatedByUserId, CaseStatusId, Observations, TokenCreated, DateCreated)
VALUES
('DICRI-2025-0001', N'Robo agravado en zona 1',              N'Fiscalía Metropolitana',                       3, 1,
 N'Expediente recién ingresado por el técnico.',                 'seed-case-1',  '2025-02-01T09:00:00'),
('DICRI-2025-0002', N'Homicidio en investigación',             N'Fiscalía de Delitos contra la Vida',          4, 2,
 N'Enviado a coordinación para revisión inicial.',               'seed-case-2',  '2025-02-02T10:00:00'),
('DICRI-2025-0004', N'Extorsión a comercio local',             N'Fiscalía contra la Extorsión',                3, 4,
 N'Rechazado por falta de fotografías de la evidencia.',         'seed-case-3',  '2025-02-04T12:00:00'),
('DICRI-2025-0005', N'Incendio en vivienda',                   N'Fiscalía de Delitos contra el Patrimonio',    5, 2,
 N'En revisión por posible expansión de investigación.',         'seed-case-4',  '2025-02-05T13:00:00'),
('DICRI-2025-0006', N'Secuestro fallido',                      N'Fiscalía contra el Crimen Organizado',        7, 1,
 N'Ingreso preliminar, se esperan más indicios.',                'seed-case-5',  '2025-02-06T14:00:00'),
('DICRI-2025-0008', N'Violencia intrafamiliar',                N'Fiscalía de la Mujer',                        4, 7,
 N'En espera de informe médico legal.',                          'seed-case-6',  '2025-02-08T16:00:00'),
('DICRI-2025-0010', N'Delitos informáticos',                   N'Fiscalía de Delitos Informáticos',            10, 2,
 N'Analizando evidencia digital.',                               'seed-case-7', '2025-02-10T18:00:00');
GO

/*============================================================
  7. EVIDENCIAS
============================================================*/
INSERT INTO dbo.Evidence
    (CaseFileId, EvidenceCode, DescriptionEvidence, EvidenceTypeId, Color, SizeDescription, WeightDescription,
     FoundLocation, CurrentLocation, CreatedByUserId, Observations, TokenCreated, DateCreated)
VALUES
(1, 'E-001', N'Pistola calibre 9mm marca Glock',                 1, N'Negro',   N'20 cm largo', 0.950,
 N'Escena del crimen, sala principal',        N'Bodega central - Estante A1',      3,
 N'Arma asegurada con cadena de custodia.',                       'seed-evid-1',  '2025-02-01T09:30:00'),
(1, 'E-002', N'Cargador con 10 municiones calibre 9mm',          2, N'Negro',   N'10 cm',       0.250,
 N'Escena del crimen, junto a la pistola',    N'Bodega central - Estante A1',      3,
 N'Municiones asociadas al arma principal.',                      'seed-evid-2',  '2025-02-01T09:35:00'),
(2, 'E-001', N'Carta de amenaza escrita a mano',                 3, N'Blanco',  N'Tamaño carta',0.020,
 N'Habitación principal de la víctima',        N'Bodega de documentos - Gaveta D3',4,
 N'Documento enviado a grafología.',                              'seed-evid-3',  '2025-02-02T10:30:00'),
(2, 'E-002', N'Camiseta con manchas de sangre',                  4, N'Rojo',    N'Talla M',     0.300,
 N'Canasta de ropa en la vivienda',            N'Cámara fría - Anaquel B2',        4,
 N'Enviada a laboratorio para análisis de ADN.',                  'seed-evid-4',  '2025-02-02T10:40:00'),
(3, 'E-001', N'Bolsa con sustancia blanca en polvo',             8, N'Transparente', N'Bolsa pequeña', 0.050,
 N'Mesa de la cocina',                         N'Bodega de evidencia química - C1',5,
 N'Posible cocaína, pendiente de resultado.',                     'seed-evid-5',  '2025-02-03T11:30:00'),
(4, 'E-001', N'Teléfono celular smartphone',                     5, N'Negro',   N'6 pulgadas',  0.180,
 N'Mostrador del comercio extorsionado',       N'Lab. de informática forense',     3,
 N'Contiene mensajes de extorsión.',                               'seed-evid-6',  '2025-02-04T12:30:00'),
(5, 'E-001', N'Botella con líquido inflamable',                  7, N'Transparente', N'1 litro', 0.900,
 N'Patio trasero de la vivienda',              N'Bodega de químicos - Estante C2', 5,
 N'Se sospecha uso para iniciar incendio.',                        'seed-evid-7',  '2025-02-05T13:30:00'),
(6, 'E-001', N'Cuchillo de cocina con manchas',                  7, N'Plateado',N'25 cm',       0.200,
 N'Vehículo utilizado en el secuestro',        N'Bodega central - Estante B1',     7,
 N'Enviado a laboratorio para huellas y ADN.',                    'seed-evid-8',  '2025-02-06T14:30:00'),
(7, 'E-001', N'Laptop marca Dell con posible evidencia digital', 5, N'Negro',   N'14 pulgadas', 2.000,
 N'Habitación de la víctima',                  N'Lab. de informática forense',     10,
 N'Pendiente extracción de información.',                          'seed-evid-9', '2025-02-08T16:30:00');
GO

/*============================================================
  8. HISTORIAL DE ESTADOS
============================================================*/
INSERT INTO dbo.CaseStatusHistory
    (CaseFileId, CaseStatusId, ChangedByUserId, Observations, TokenCreated, DateCreated)
VALUES
(1, 1, 3, N'Expediente registrado por el técnico Carlos.', 'seed-hist-1',  '2025-02-01T09:05:00'),
(2, 1, 4, N'Expediente registrado por la técnica Ana.', 'seed-hist-2',  '2025-02-02T10:05:00'),
(2, 2, 2, N'Coordinadora María inició la revisión del expediente.', 'seed-hist-3',  '2025-02-02T11:00:00'),
(3, 1, 3, N'Expediente registrado por el técnico Carlos.', 'seed-hist-4',  '2025-02-04T12:05:00'),
(3, 4, 2, N'Coordinadora María rechazó el expediente por falta de evidencia fotográfica.', 'seed-hist-5',  '2025-02-04T13:00:00'),
(4, 1, 5, N'Expediente registrado por el técnico Luis.', 'seed-hist-6',  '2025-02-05T13:05:00'),
(4, 2, 9, N'Coordinador Pedro colocó el expediente en revisión por posible expansión de la investigación.', 'seed-hist-7',  '2025-02-05T14:00:00'),
(5, 1, 7, N'Expediente registrado por el técnico Diego en apoyo al área operativa.', 'seed-hist-8',  '2025-02-06T14:05:00'),
(6, 1, 4, N'Expediente registrado por la técnica Ana.', 'seed-hist-9',  '2025-02-08T16:05:00'),
(6, 7, 2, N'Coordinadora María dejó el expediente en espera de informe médico legal.', 'seed-hist-10', '2025-02-08T17:00:00'),
(7, 1, 10, N'Expediente registrado por la técnica Gabriela.', 'seed-hist-11', '2025-02-10T18:05:00'),
(7, 2, 2, N'Coordinadora María colocó el expediente en revisión por análisis de evidencia digital.', 'seed-hist-12', '2025-02-10T19:00:00');
GO
