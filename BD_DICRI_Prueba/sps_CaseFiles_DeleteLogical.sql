/* ==============================================================
    SP:             [dbo].[sps_CaseFiles_DeleteLogical]
    Propósito:      Realiza el borrado lógico de un expediente y de sus evidencias.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_CaseFiles_DeleteLogical]
    @CaseFileId			INT,
	@DeletedByUserId	INT,
    @TokenUpdated		NVARCHAR(200) = 'SYS-SYSTEM'
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

        IF NOT EXISTS (
            SELECT 1 FROM dbo.CaseFiles CF
            WHERE CF.CaseFileId = @CaseFileId
        )
        BEGIN
            RAISERROR('El expediente especificado no existe.', 16, 1);
        END

        IF EXISTS (
            SELECT 1 FROM dbo.CaseFiles CF
            WHERE CF.CaseFileId = @CaseFileId AND CF.IsActive = 0
        )
        BEGIN
            RAISERROR('El expediente ya se encuentra inactivo.', 16, 1);
        END

        --------------------------------------------------------
        --			Borrado lógico del expediente
        --------------------------------------------------------
        UPDATE CF
        SET 
            CF.IsActive     = 0,
			CF.CreatedByUserId = @DeletedByUserId,
            CF.TokenUpdated = @TokenUpdated,
            CF.DateUpdated  = GETDATE()
        FROM dbo.CaseFiles CF
        WHERE CF.CaseFileId = @CaseFileId;

        --------------------------------------------------------
        --		Borrado lógico de evidencias relacionadas
        --------------------------------------------------------
        UPDATE E
        SET 
            E.IsActive     = 0,
            E.TokenUpdated = @TokenUpdated,
            E.DateUpdated  = GETDATE()
        FROM dbo.Evidence E
        WHERE E.CaseFileId = @CaseFileId AND E.IsActive = 1;

        --------------------------------------------------------
        --			Devolver expediente
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
            U.FirstName  AS DeletedByFirstName,
            U.LastName   AS DeletedByLastName,
            U.UserName   AS DeletedByUserName,
            CF.CaseStatusId,
            CS.NameCaseStatus,
            CF.Observations,
            CF.IsActive,
            ISNULL(EC.EvidenceCount, 0) AS EvidenceCount
        FROM dbo.CaseFiles CF
        INNER JOIN dbo.Users U
            ON U.UserId = CF.CreatedByUserId
        INNER JOIN dbo.Cat_CaseStatuses CS
            ON CS.CaseStatusId = CF.CaseStatusId
        LEFT JOIN EvidenceCount EC
            ON EC.CaseFileId = CF.CaseFileId
        WHERE CF.CaseFileId = @CaseFileId;

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
