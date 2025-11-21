/* ==============================================================
    SP:             [dbo].[sps_CaseFiles_Update]
    Propósito:      Actualiza la información general de un expediente.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_CaseFiles_Update]
    @CaseFileId        INT,
    @CaseNumber        NVARCHAR(50),
    @DescriptionCase   NVARCHAR(500),
    @ProsecutorOffice  NVARCHAR(150)  = NULL,
    @Observations      NVARCHAR(500)  = NULL,
	@UpdatedByUserId   INT,
    @TokenUpdated      NVARCHAR(200)  = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        --------------------------------------------------------
        --			Validaciones básicas
        --------------------------------------------------------

        IF @CaseFileId IS NULL
        BEGIN
            RAISERROR('El expediente es obligatorio.', 16, 1);
        END

        IF NOT EXISTS (
            SELECT 1 FROM dbo.CaseFiles CF
            WHERE CF.CaseFileId = @CaseFileId AND CF.IsActive = 1
        )
        BEGIN
            RAISERROR('El expediente especificado no existe o no está activo.', 16, 1);
        END

        IF EXISTS (
            SELECT 1 FROM dbo.CaseFiles CF
            WHERE CF.CaseNumber = @CaseNumber AND CF.CaseFileId <> @CaseFileId
        )
        BEGIN
            RAISERROR('El número de expediente ya está asignado a otro registro.', 16, 1);
        END

        --------------------------------------------------------
        --				Actualizar expediente
        --------------------------------------------------------
        UPDATE CF
        SET 
            CF.CaseNumber       = @CaseNumber,
            CF.DescriptionCase  = @DescriptionCase,
            CF.ProsecutorOffice = @ProsecutorOffice,
            CF.Observations     = @Observations,
            CF.TokenUpdated     = @TokenUpdated,
            CF.DateUpdated      = GETDATE()
        FROM dbo.CaseFiles CF
        WHERE CF.CaseFileId = @CaseFileId;

        --------------------------------------------------------
        --			Devolver expediente actualizado
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
