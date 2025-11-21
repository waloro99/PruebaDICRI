/* ==============================================================
    SP:             [dbo].[sps_Evidence_GetByCaseFileId]
    Propósito:      Obtiene el listado de evidencias asociadas a un expediente específico.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Evidence_GetByCaseFileId]
    @CaseFileId INT,
    @Token      NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        --------------------------------------------------------
        --		Validaciones básicas
        --------------------------------------------------------
        IF @CaseFileId IS NULL
        BEGIN
            RAISERROR('El expediente es obligatorio.', 16, 1);
        END

        IF NOT EXISTS (
            SELECT 1 FROM dbo.CaseFiles CF
            WHERE CF.CaseFileId = @CaseFileId AND CF.IsActive   = 1
        )
        BEGIN
            RAISERROR('El expediente especificado no existe o no está activo.', 16, 1);
        END

        --------------------------------------------------------
        --		Devolver evidencias del expediente
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
        WHERE E.CaseFileId = @CaseFileId AND E.IsActive   = 1
        ORDER BY
            E.DateCreated ASC,
            E.EvidenceId ASC;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        ;THROW;
    END CATCH;
END
GO
