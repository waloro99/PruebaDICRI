/* ==============================================================
    SP:             [dbo].[sps_Evidence_DeleteLogical]
    Propósito:      Realiza el borrado lógico de una evidencia.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Evidence_DeleteLogical]
    @EvidenceId			INT,
	@DeletedByUserId	INT,
    @TokenUpdated		NVARCHAR(100) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        --------------------------------------------------------
        --				Validaciones básicas
        --------------------------------------------------------
        IF @EvidenceId IS NULL
        BEGIN
            RAISERROR('El indicio es obligatorio.', 16, 1);
        END

        IF NOT EXISTS (
            SELECT 1 FROM dbo.Evidence E
            WHERE E.EvidenceId = @EvidenceId
        )
        BEGIN
            RAISERROR('La evidencia especificada no existe.', 16, 1);
        END

        IF EXISTS (
            SELECT 1 FROM dbo.Evidence E
            WHERE E.EvidenceId = @EvidenceId AND E.IsActive   = 0
        )
        BEGIN
            RAISERROR('La evidencia ya se encuentra inactiva.', 16, 1);
        END

        --------------------------------------------------------
        --		Borrado lógico de la evidencia
        --------------------------------------------------------
        UPDATE E
        SET 
            E.IsActive			= 0,
			E.CreatedByUserId	= @DeletedByUserId,
            E.TokenUpdated		= @TokenUpdated,
            E.DateUpdated		= GETDATE()
        FROM dbo.Evidence E
        WHERE E.EvidenceId = @EvidenceId AND E.IsActive = 1;

        --------------------------------------------------------
        --					Devolver evidencia
        --------------------------------------------------------
        SELECT
            E.EvidenceId,
            E.CaseFileId,
            CF.CaseNumber,
            E.EvidenceCode,
            E.DescriptionEvidence,
            E.EvidenceTypeId,
            ET.NameEvidenceType,
            E.Color,
            E.SizeDescription,
            E.WeightDescription,
            E.FoundLocation,
            E.CurrentLocation,
            E.CreatedByUserId,
            U.FirstName  AS CreatedByFirstName,
            U.LastName   AS CreatedByLastName,
            U.UserName   AS CreatedByUserName,
            E.Observations
        FROM dbo.Evidence E
        INNER JOIN dbo.CaseFiles CF
            ON CF.CaseFileId = E.CaseFileId
        INNER JOIN dbo.Cat_EvidenceTypes ET
            ON ET.EvidenceTypeId = E.EvidenceTypeId
        INNER JOIN dbo.Users U
            ON U.UserId = E.CreatedByUserId
        WHERE E.EvidenceId = @EvidenceId;

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
