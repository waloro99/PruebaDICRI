/* ==============================================================
    SP:             [dbo].[sps_CaseFiles_GetById]
    Propósito:      Obtiene el detalle de un expediente específico.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_CaseFiles_GetById]
    @CaseFileId INT,
    @Token      NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        --------------------------------------------------------
        --		Validación básica del parámetro
        --------------------------------------------------------
        IF @CaseFileId IS NULL
        BEGIN
            RAISERROR('El expediente es obligatorio.', 16, 1);
        END

        --------------------------------------------------------
        --		Verificar existencia del expediente activo
        --------------------------------------------------------
        IF NOT EXISTS (
            SELECT 1 FROM dbo.CaseFiles CF
            WHERE CF.CaseFileId = @CaseFileId AND CF.IsActive = 1
        )
        BEGIN
            SELECT 
                CAST(NULL AS INT)             AS CaseFileId,
                CAST(NULL AS NVARCHAR(50))    AS CaseNumber,
                CAST(NULL AS NVARCHAR(500))   AS DescriptionCase,
                CAST(NULL AS NVARCHAR(150))   AS ProsecutorOffice,
                CAST(NULL AS INT)             AS CreatedByUserId,
                CAST(NULL AS NVARCHAR(100))   AS CreatedByFirstName,
                CAST(NULL AS NVARCHAR(100))   AS CreatedByLastName,
                CAST(NULL AS NVARCHAR(50))    AS CreatedByUserName,
                CAST(NULL AS INT)             AS CaseStatusId,
                CAST(NULL AS NVARCHAR(50))    AS NameCaseStatus,
                CAST(NULL AS NVARCHAR(500))   AS Observations,
                CAST(NULL AS BIT)             AS IsActive,
                CAST(NULL AS NVARCHAR(100))   AS TokenCreated,
                CAST(NULL AS DATETIME)        AS DateCreated,
                CAST(NULL AS NVARCHAR(100))   AS TokenUpdated,
                CAST(NULL AS DATETIME)        AS DateUpdated,
                CAST(NULL AS INT)             AS EvidenceCount;

            RETURN;
        END

        --------------------------------------------------------
        --			Obtener detalle del expediente
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

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        ;THROW;
    END CATCH;
END
GO
