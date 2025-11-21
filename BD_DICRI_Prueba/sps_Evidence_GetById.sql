/* ==============================================================
    SP:             [dbo].[sps_Evidence_GetById]
    Propósito:      Obtiene el detalle de una evidencia específica.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Evidence_GetById]
    @EvidenceId INT,
    @Token      NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        --------------------------------------------------------
        --			Validación básica del parámetro
        --------------------------------------------------------
        IF @EvidenceId IS NULL
        BEGIN
            RAISERROR('El indicio es obligatorio.', 16, 1);
        END

        --------------------------------------------------------
        --		Verificar existencia de la evidencia activa
        --------------------------------------------------------
        IF NOT EXISTS (
            SELECT 1 FROM dbo.Evidence E
            WHERE E.EvidenceId = @EvidenceId AND E.IsActive = 1
        )
        BEGIN
            SELECT
                CAST(NULL AS INT)             AS EvidenceId,
                CAST(NULL AS INT)             AS CaseFileId,
                CAST(NULL AS NVARCHAR(50))    AS CaseNumber,
                CAST(NULL AS NVARCHAR(50))    AS EvidenceCode,
                CAST(NULL AS NVARCHAR(500))   AS DescriptionEvidence,
                CAST(NULL AS INT)             AS EvidenceTypeId,
                CAST(NULL AS NVARCHAR(50))    AS NameEvidenceType,
                CAST(NULL AS NVARCHAR(50))    AS Color,
                CAST(NULL AS NVARCHAR(100))   AS SizeDescription,
                CAST(NULL AS DECIMAL(10,3))   AS WeightDescription,
                CAST(NULL AS NVARCHAR(200))   AS FoundLocation,
                CAST(NULL AS NVARCHAR(200))   AS CurrentLocation,
                CAST(NULL AS INT)             AS CreatedByUserId,
                CAST(NULL AS NVARCHAR(100))   AS CreatedByFirstName,
                CAST(NULL AS NVARCHAR(100))   AS CreatedByLastName,
                CAST(NULL AS NVARCHAR(50))    AS CreatedByUserName,
                CAST(NULL AS NVARCHAR(500))   AS Observations,
                CAST(NULL AS BIT)             AS IsActive,
                CAST(NULL AS NVARCHAR(100))   AS TokenCreated,
                CAST(NULL AS DATETIME)        AS DateCreated,
                CAST(NULL AS NVARCHAR(100))   AS TokenUpdated,
                CAST(NULL AS DATETIME)        AS DateUpdated;

            RETURN;
        END

        --------------------------------------------------------
        --				Devolver evidencia
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
        WHERE E.EvidenceId = @EvidenceId AND E.IsActive   = 1;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        ;THROW;
    END CATCH;
END
GO
