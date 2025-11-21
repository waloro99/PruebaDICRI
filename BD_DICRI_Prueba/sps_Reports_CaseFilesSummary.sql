/* ==============================================================
    SP:             [dbo].[sps_Reports_CaseFilesSummary]
    Propósito:      Devuelve un resumen de expedientes y evidencias, con filtros opcionales y resultados agregados globales y por estado.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Reports_CaseFilesSummary]
    @FromDate        DATETIME      = NULL,
    @ToDate          DATETIME      = NULL,
    @CaseStatusId    INT           = NULL,
    @CreatedByUserId INT           = NULL,
    @Token           NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        --------------------------------------------------------
        --		Base de expedientes filtrados
        --------------------------------------------------------
        IF OBJECT_ID('tempdb..#CFBase') IS NOT NULL DROP TABLE #CFBase;

        CREATE TABLE #CFBase
        (
            CaseFileId      INT        NOT NULL PRIMARY KEY,
            CaseStatusId    INT        NOT NULL,
            CreatedByUserId INT        NOT NULL,
            DateCreated     DATETIME   NOT NULL
        );

        INSERT INTO #CFBase (CaseFileId, CaseStatusId, CreatedByUserId, DateCreated)
        SELECT
            CF.CaseFileId,
            CF.CaseStatusId,
            CF.CreatedByUserId,
            CF.DateCreated
        FROM dbo.CaseFiles CF
        WHERE CF.IsActive = 1
          AND (@FromDate IS NULL OR CF.DateCreated >= @FromDate)
          AND (@ToDate   IS NULL OR CF.DateCreated < DATEADD(DAY, 1, @ToDate))
          AND (@CaseStatusId    IS NULL OR CF.CaseStatusId    = @CaseStatusId)
          AND (@CreatedByUserId IS NULL OR CF.CreatedByUserId = @CreatedByUserId);

        --------------------------------------------------------
        --			Agregado de evidencias
        --------------------------------------------------------
        IF OBJECT_ID('tempdb..#EvidenceAgg') IS NOT NULL DROP TABLE #EvidenceAgg;

        CREATE TABLE #EvidenceAgg
        (
            CaseFileId     INT NOT NULL PRIMARY KEY,
            EvidenceCount  INT NOT NULL
        );

        INSERT INTO #EvidenceAgg (CaseFileId, EvidenceCount)
        SELECT 
            E.CaseFileId,
            COUNT(1) AS EvidenceCount
        FROM dbo.Evidence E
        INNER JOIN #CFBase CF
            ON CF.CaseFileId = E.CaseFileId
        WHERE E.IsActive = 1
        GROUP BY E.CaseFileId;

        --------------------------------------------------------
        --				Resumen global
        --------------------------------------------------------
        SELECT
            COUNT(1) AS TotalCaseFiles,
            COUNT(CASE WHEN EA.EvidenceCount > 0 THEN 1 END) AS TotalCaseFilesWithEvidence,
            ISNULL(SUM(EA.EvidenceCount), 0)                 AS TotalEvidence
        FROM #CFBase CF
        LEFT JOIN #EvidenceAgg EA
            ON EA.CaseFileId = CF.CaseFileId;

        --------------------------------------------------------
        --				Resumen por estado
        --------------------------------------------------------
        SELECT
            CS.CaseStatusId,
            CS.NameCaseStatus,
            COUNT(DISTINCT CF.CaseFileId) AS CaseCount,
            ISNULL(SUM(EA.EvidenceCount), 0) AS EvidenceCount
        FROM #CFBase CF
        INNER JOIN dbo.Cat_CaseStatuses CS
            ON CS.CaseStatusId = CF.CaseStatusId
        LEFT JOIN #EvidenceAgg EA
            ON EA.CaseFileId = CF.CaseFileId
        GROUP BY
            CS.CaseStatusId,
            CS.NameCaseStatus
        ORDER BY
            CS.NameCaseStatus;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        ;THROW;
    END CATCH;
END
GO
