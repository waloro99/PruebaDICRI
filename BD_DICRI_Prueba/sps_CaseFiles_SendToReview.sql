/* ==============================================================
    SP:             [dbo].[sps_CaseFiles_SendToReview]
    Propósito:      Cambia el estado de un expediente a 'EN REVISIÓN' y registra el cambio en el historial.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_CaseFiles_SendToReview]
    @CaseFileId        INT,
    @ChangedByUserId   INT,
    @Observations      NVARCHAR(500) = NULL,
    @TokenUpdated      NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        --------------------------------------------------------
        --				Validaciones básicas
        --------------------------------------------------------

        IF @CaseFileId IS NULL
        BEGIN
            RAISERROR('El expediente es obligatorio.', 16, 1);
        END

        IF @ChangedByUserId IS NULL
        BEGIN
            RAISERROR('El usuario es obligatorio.', 16, 1);
        END

        IF NOT EXISTS (
            SELECT 1 FROM dbo.CaseFiles CF
            WHERE CF.CaseFileId = @CaseFileId AND CF.IsActive = 1
        )
        BEGIN
            RAISERROR('El expediente especificado no existe o no está activo.', 16, 1);
        END

        IF NOT EXISTS (
            SELECT 1 FROM dbo.Users U
            WHERE U.UserId   = @ChangedByUserId AND U.IsActive = 1
        )
        BEGIN
            RAISERROR('El usuario que realiza el cambio no existe o no está activo.', 16, 1);
        END

        --------------------------------------------------------
        --			Resolver estado 'EN REVISIÓN'
        --------------------------------------------------------
        DECLARE @NewStatusId INT;

        SELECT @NewStatusId = CS.CaseStatusId
        FROM dbo.Cat_CaseStatuses CS
        WHERE CS.NameCaseStatus = N'EN REVISIÓN' AND CS.IsActive = 1;

        IF @NewStatusId IS NULL
        BEGIN
            RAISERROR('No se encontró el estado EN REVISIÓN activo en el catálogo.', 16, 1);
        END

        --------------------------------------------------------
        --		Validar que no esté ya en EN REVISIÓN
        --------------------------------------------------------
        DECLARE @CurrentStatusId INT , @StatusRegister INT;

        SELECT @CurrentStatusId = CF.CaseStatusId
        FROM dbo.CaseFiles CF
        WHERE CF.CaseFileId = @CaseFileId;

        IF @CurrentStatusId = @NewStatusId
        BEGIN
            RAISERROR('El expediente ya se encuentra en estado EN REVISIÓN.', 16, 1);
        END

		SELECT @StatusRegister = CS.CaseStatusId
        FROM dbo.Cat_CaseStatuses CS
        WHERE CS.NameCaseStatus = N'REGISTRADO' AND CS.IsActive = 1;

		IF @CurrentStatusId != @StatusRegister
		BEGIN
			RAISERROR('El expediente no se encuentra en estado REGISTRADO para dejarlo en revisión.', 16, 1);
		END

        --------------------------------------------------------
        --			Actualizar expediente
        --------------------------------------------------------
        UPDATE CF
        SET 
            CF.CaseStatusId = @NewStatusId,
            CF.Observations = CASE 
                                WHEN @Observations IS NOT NULL AND LTRIM(RTRIM(@Observations)) <> '' 
                                THEN @Observations
                                ELSE N'Expediente enviado a revisión.'
                              END,
            CF.TokenUpdated = @TokenUpdated,
            CF.DateUpdated  = GETDATE()
        FROM dbo.CaseFiles CF
        WHERE CF.CaseFileId = @CaseFileId;

        --------------------------------------------------------
        --		Insertar registro en historial de estados
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
            @CaseFileId,
            @NewStatusId,
            @ChangedByUserId,
            ISNULL(@Observations, N'Expediente enviado a revisión.'),
            1,
            @TokenUpdated,
            GETDATE()
        );

        --------------------------------------------------------
        --		Devolver expediente actualizado
        --------------------------------------------------------
        ;WITH EvidenceCount AS
        (
            SELECT 
                E.CaseFileId,
                COUNT(1) AS EvidenceCount
            FROM dbo.Evidence E
            WHERE E.IsActive = 1
            GROUP BY E.CaseFileId
        )
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
            CF.Observations,
            ISNULL(EC.EvidenceCount, 0) AS EvidenceCount
        FROM dbo.CaseFiles CF
        INNER JOIN dbo.Users U
            ON U.UserId = CF.CreatedByUserId
        INNER JOIN dbo.Cat_CaseStatuses CS
            ON CS.CaseStatusId = CF.CaseStatusId
        LEFT JOIN EvidenceCount EC
            ON EC.CaseFileId = CF.CaseFileId
        WHERE CF.CaseFileId = @CaseFileId AND CF.IsActive = 1;

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
