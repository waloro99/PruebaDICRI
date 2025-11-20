-- Crear la base de datos para el sistema de expedientes DICRI
CREATE DATABASE DICRI_Prueba;
GO

USE DICRI_Prueba;
GO

/*============================================================
  1. TABLAS DE SEGURIDAD
============================================================*/

-- ROLES: Tabla para designar los diferentes tipos de roles a utilizar por los usuarios.
CREATE TABLE dbo.Roles
(
    RoleId			INT IDENTITY(1,1) CONSTRAINT PK_Roles PRIMARY KEY,
    NameRole        NVARCHAR(50)	NOT NULL,
    DescriptionRole NVARCHAR(200)	NULL,
    IsActive		BIT				NOT NULL CONSTRAINT DF_Roles_IsActive DEFAULT (1),
	TokenCreated	NVARCHAR(100)	NOT NULL,
	DateCreated		DATETIME		NOT NULL,
	TokenUpdated	NVARCHAR(100)	NULL,
	DateUpdated		DATETIME		NULL,
    CONSTRAINT UQ_Roles_Name UNIQUE (NameRole)
);
GO

-- USUARIOS: Tabla para guardar información de los usuarios que utilizaran el sistema de DICRI.
CREATE TABLE dbo.Users
(
    UserId          INT IDENTITY(1,1) CONSTRAINT PK_Users PRIMARY KEY,
    FirstName       NVARCHAR(100)	NOT NULL,
    LastName        NVARCHAR(100)	NOT NULL,
    UserName        NVARCHAR(50)	NOT NULL,
    Email           NVARCHAR(150)	NOT NULL,
    PhoneNumber     NVARCHAR(20)	NULL,
    PasswordUser    NVARCHAR(255)	NOT NULL,
    IsActive		BIT				NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT (1),
	TokenCreated	NVARCHAR(100)	NOT NULL,
	DateCreated		DATETIME		NOT NULL,
	TokenUpdated	NVARCHAR(100)	NULL,
	DateUpdated		DATETIME		NULL,
    CONSTRAINT UQ_Users_UserName UNIQUE (UserName)
);
GO

-- ROLES DE USUARIO: Tabla para guardar la relación que hay entre los usuarios con sus respectivos roles.
CREATE TABLE dbo.UserRole
(
    UserRoleId			INT IDENTITY(1,1) CONSTRAINT PK_UserRole PRIMARY KEY,
    UserId				INT				NOT NULL,
    RoleId				INT				NOT NULL,
    IsActive			BIT				NOT NULL CONSTRAINT DF_UserRole_IsActive DEFAULT (1),
	TokenCreated		NVARCHAR(100)	NOT NULL,
	DateCreated			DATETIME		NOT NULL,
	TokenUpdated		NVARCHAR(100)	NULL,
	DateUpdated			DATETIME		NULL,
    CONSTRAINT UQ_UserRole_User_Role UNIQUE (UserId, RoleId),
    CONSTRAINT FK_UserRole_Users FOREIGN KEY (UserId)
        REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_UserRole_Roles FOREIGN KEY (RoleId)
        REFERENCES dbo.Roles(RoleId)
);
GO

/*============================================================
  2. TABLA DE CATÁLOGOS
============================================================*/

-- ESTADOS DE EXPEDIENTE: Tabla que tendra los diferentes tipos de estado de un expediente.
CREATE TABLE dbo.Cat_CaseStatuses
(
    CaseStatusId			INT IDENTITY(1,1) CONSTRAINT PK_CaseStatuses PRIMARY KEY,
    NameCaseStatus			NVARCHAR(50)	NOT NULL,
    DescriptionCaseStatus	NVARCHAR(200)	NULL,
    IsActive				BIT				NOT NULL CONSTRAINT DF_Cat_CaseStatuses_IsActive DEFAULT (1),
	TokenCreated			NVARCHAR(100)	NOT NULL,
	DateCreated				DATETIME		NOT NULL,
	TokenUpdated			NVARCHAR(100)	NULL,
	DateUpdated				DATETIME		NULL,
    CONSTRAINT UQ_CaseStatuses_Name UNIQUE (NameCaseStatus)
);
GO

-- TIPOS DE INDICIO: Tabla que tendra los diferentes tipos de indicios posibles que registrar.
CREATE TABLE dbo.Cat_EvidenceTypes
(
    EvidenceTypeId				INT IDENTITY(1,1) CONSTRAINT PK_EvidenceTypes PRIMARY KEY,
    NameEvidenceType			NVARCHAR(50)	NOT NULL,
    DescriptionEvidenceType		NVARCHAR(200)	NULL,
    IsActive					BIT				NOT NULL CONSTRAINT DF_EvidenceTypes_IsActive DEFAULT (1),
	TokenCreated				NVARCHAR(100)	NOT NULL,
	DateCreated					DATETIME		NOT NULL,
	TokenUpdated				NVARCHAR(100)	NULL,
	DateUpdated					DATETIME		NULL,
    CONSTRAINT UQ_EvidenceTypes_Name UNIQUE (NameEvidenceType)
);
GO

/*============================================================
  3. EXPEDIENTES DICRI
============================================================*/

-- EXPEDIENTES: Tabla que tendra la información relacionada a la información del expediente.
CREATE TABLE dbo.CaseFiles
(
    CaseFileId				INT IDENTITY(1,1) CONSTRAINT PK_CaseFiles PRIMARY KEY,
    CaseNumber				NVARCHAR(50)	NOT NULL,
    DescriptionCase			NVARCHAR(500)	NOT NULL,
    ProsecutorOffice		NVARCHAR(150)	NULL,
    CreatedByUserId			INT				NOT NULL,
    CaseStatusId			INT				NOT NULL,
    Observations			NVARCHAR(500)	NULL,
	IsActive				BIT				NOT NULL CONSTRAINT DF_CaseFiles_IsActive DEFAULT (1),
	TokenCreated			NVARCHAR(100)	NOT NULL,
	DateCreated				DATETIME		NOT NULL,
	TokenUpdated			NVARCHAR(100)	NULL,
	DateUpdated				DATETIME		NULL,
    CONSTRAINT UQ_CaseFiles_CaseNumber UNIQUE (CaseNumber),
    CONSTRAINT FK_CaseFiles_Users_CreatedBy FOREIGN KEY (CreatedByUserId)
        REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_CaseFiles_CaseStatuses FOREIGN KEY (CaseStatusId)
        REFERENCES dbo.Cat_CaseStatuses(CaseStatusId)
);
GO

/*============================================================
  4. EVIDENCIAS DICRI
============================================================*/

-- INDICIOS: Tabla que tendra la información de las evidencia del expediente.
CREATE TABLE dbo.Evidence
(
    EvidenceId			INT IDENTITY(1,1) CONSTRAINT PK_Evidence PRIMARY KEY,
    CaseFileId			INT				NOT NULL,
    EvidenceCode		NVARCHAR(50)	NOT NULL,
    DescriptionEvidence	NVARCHAR(500)	NOT NULL,
    EvidenceTypeId		INT				NOT NULL,
    Color				NVARCHAR(50)	NULL,
    SizeDescription		NVARCHAR(100)	NULL,
    WeightDescription	DECIMAL(10,3)	NULL,
    FoundLocation		NVARCHAR(200)	NULL,
    CurrentLocation		NVARCHAR(200)	NULL,
    CreatedByUserId		INT				NOT NULL,
    Observations		NVARCHAR(500)	NULL,
	IsActive			BIT				NOT NULL CONSTRAINT DF_Evidence_IsActive DEFAULT (1),
	TokenCreated		NVARCHAR(100)	NOT NULL,
	DateCreated			DATETIME		NOT NULL,
	TokenUpdated		NVARCHAR(100)	NULL,
	DateUpdated			DATETIME		NULL,
	CONSTRAINT UQ_Evidence_CaseFileId_EvidenceCode UNIQUE (CaseFileId, EvidenceCode),
    CONSTRAINT FK_Evidence_CaseFiles FOREIGN KEY (CaseFileId)
        REFERENCES dbo.CaseFiles(CaseFileId),
    CONSTRAINT FK_Evidence_EvidenceTypes FOREIGN KEY (EvidenceTypeId)
        REFERENCES dbo.Cat_EvidenceTypes(EvidenceTypeId),
    CONSTRAINT FK_Evidence_Users_CreatedBy FOREIGN KEY (CreatedByUserId)
        REFERENCES dbo.Users(UserId)
);
GO

/*============================================================
  5. HISTORIAL DE EXPEDIENTES
============================================================*/

-- HISTORIAL DE ESTADO DE EXPEDIENTES: Tabla que tendra la información para tener el historico del cambio de estado de los expedientes.
CREATE TABLE dbo.CaseStatusHistory
(
    CaseStatusHistoryId INT IDENTITY(1,1) CONSTRAINT PK_CaseStatusHistory PRIMARY KEY,
    CaseFileId          INT				NOT NULL,
    CaseStatusId        INT				NOT NULL,
    ChangedByUserId     INT				NOT NULL,
    Observations		NVARCHAR(1000)	NOT NULL,
	IsActive			BIT				NOT NULL CONSTRAINT DF_CaseStatusHistory_IsActive DEFAULT (1),
	TokenCreated		NVARCHAR(100)	NOT NULL,
	DateCreated			DATETIME		NOT NULL,
	TokenUpdated		NVARCHAR(100)	NULL,
	DateUpdated			DATETIME		NULL,
    CONSTRAINT FK_CaseStatusHistory_CaseFiles FOREIGN KEY (CaseFileId)
        REFERENCES dbo.CaseFiles(CaseFileId),
    CONSTRAINT FK_CaseStatusHistory_CaseStatuses FOREIGN KEY (CaseStatusId)
        REFERENCES dbo.Cat_CaseStatuses(CaseStatusId),
    CONSTRAINT FK_CaseStatusHistory_Users FOREIGN KEY (ChangedByUserId)
        REFERENCES dbo.Users(UserId)
);
GO

/*============================================================
  6. ÍNDICES
============================================================*/

-- Búsquedas y reportes por estado y fecha de registro del case file
CREATE NONCLUSTERED INDEX IX_CaseFiles_Status_DateCreated ON dbo.CaseFiles (CaseStatusId, DateCreated);
GO

-- Reportes por estado y fecha de cambio del historial
CREATE NONCLUSTERED INDEX IX_CaseStatusHistory_Status_DateCreated ON dbo.CaseStatusHistory (CaseStatusId, DateCreated);
GO

-- Búsqueda rápida de evidencias por expediente
CREATE NONCLUSTERED INDEX IX_Evidence_CaseFile ON dbo.Evidence (CaseFileId);
GO
