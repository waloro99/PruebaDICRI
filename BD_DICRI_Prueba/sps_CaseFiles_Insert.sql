/* ==============================================================
    SP:             [dbo].[sps_CaseFiles_Insert]
    Propósito:      Crea un nuevo expediente en el sistema y registra su estado inicial en el historial.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_CaseFiles_Insert]
    @CaseNumber        NVARCHAR(50),
    @DescriptionCase   NVARCHAR(500),
    @ProsecutorOffice  NVARCHAR(150)   = NULL,
    @CreatedByUserId   INT,
    @CaseStatusId      INT             = NULL,
    @Observations      NVARCHAR(500)   = NULL,
    @TokenCreated      NVARCHAR(200)   = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- CaseNumber único
        IF EXISTS (SELECT 1 FROM dbo.CaseFiles WHERE CaseNumber = @CaseNumber)
        BEGIN
            RAISERROR('El número de expediente ya existe.', 16, 1);
        END

        -- Usuario creador válido y activo
        IF NOT EXISTS (
            SELECT 1 FROM dbo.Users U
            WHERE U.UserId = @CreatedByUserId AND U.IsActive = 1
        )
        BEGIN
            RAISERROR('El usuario creador especificado no existe o no está activo.', 16, 1);
        END

        --------------------------------------------------------
        --			Resolver estado del expediente
        --------------------------------------------------------
        DECLARE @FinalCaseStatusId INT;

        IF @CaseStatusId IS NOT NULL
        BEGIN
            -- Validar CaseStatusId enviado
            IF NOT EXISTS (
                SELECT 1 FROM dbo.Cat_CaseStatuses CS
                WHERE CS.CaseStatusId = @CaseStatusId AND CS.IsActive = 1
            )
            BEGIN
                RAISERROR('El estado de expediente especificado no existe o no está activo.', 16, 1);
            END

            SET @FinalCaseStatusId = @CaseStatusId;
        END
        ELSE
        BEGIN
            SELECT @FinalCaseStatusId = CS.CaseStatusId
            FROM dbo.Cat_CaseStatuses CS
            WHERE CS.NameCaseStatus = N'REGISTRADO' AND CS.IsActive = 1;

            IF @FinalCaseStatusId IS NULL
            BEGIN
                RAISERROR('No se encontró el estado REGISTRADO activo para usar como estado inicial.', 16, 1);
            END
        END

        --------------------------------------------------------
        --				Insertar expediente
        --------------------------------------------------------
        DECLARE @NewCaseFileId INT;

        INSERT INTO dbo.CaseFiles
        (
            CaseNumber,
            DescriptionCase,
            ProsecutorOffice,
            CreatedByUserId,
            CaseStatusId,
            Observations,
            IsActive,
            TokenCreated,
            DateCreated
        )
        VALUES
        (
            @CaseNumber,
            @DescriptionCase,
            @ProsecutorOffice,
            @CreatedByUserId,
            @FinalCaseStatusId,
            ISNULL(@Observations, N'Expediente creado.'),
            1,
            @TokenCreated,
            GETDATE()
        );

        SET @NewCaseFileId = SCOPE_IDENTITY();

        --------------------------------------------------------
        --	Insertar registro inicial en historial de estados
        --------------------------------------------------------
        INSERT INTO dbo.CaseStatusHistory
        (
            CaseFileId,
            CaseStatusId,
            ChangedByUserId,
            Observations,
            IsActive,
            TokenCreated,
            DateCreated
        )
        VALUES
        (
            @NewCaseFileId,
            @FinalCaseStatusId,
            @CreatedByUserId,
            ISNULL(@Observations, N'Expediente creado.'),
            1,
            @TokenCreated,
            GETDATE()
        );

        --------------------------------------------------------
        --			Devolver expediente creado
        --------------------------------------------------------
        SELECT 
            CF.CaseFileId,
            CF.CaseNumber,
            CF.DescriptionCase,
            CF.ProsecutorOffice,
            CF.CreatedByUserId,
            U.FirstName  AS CreatedByFirstName,
            U.LastName   AS CreatedByLastName,
            U.UserName   AS CreatedByUserName,
            CF.CaseStatusId,
            CS.NameCaseStatus,
            CF.Observations
        FROM dbo.CaseFiles CF
        INNER JOIN dbo.Users U
            ON U.UserId = CF.CreatedByUserId
        INNER JOIN dbo.Cat_CaseStatuses CS
            ON CS.CaseStatusId = CF.CaseStatusId
        WHERE CF.CaseFileId = @NewCaseFileId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        ;THROW;
    END CATCH;
END
GO
