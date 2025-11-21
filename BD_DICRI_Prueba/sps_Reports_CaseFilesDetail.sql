/* ==============================================================
    SP:             [dbo].[sps_Reports_CaseFilesDetail]
    Propósito:      Devuelve el detalle de expedientes para reportes.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Reports_CaseFilesDetail]
    @FromDate        DATETIME      = NULL,
    @ToDate          DATETIME      = NULL,
    @CaseStatusId    INT           = NULL,
    @CreatedByUserId INT           = NULL,
    @Token           NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        /* ------------------------------------------------------
					base de expedientes filtrados
           ------------------------------------------------------ */
        ;WITH CFBase AS
        (
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
              AND (@CreatedByUserId IS NULL OR CF.CreatedByUserId = @CreatedByUserId)
        ),
        EvidenceAgg AS
        (
            SELECT 
                E.CaseFileId,
                COUNT(1) AS EvidenceCount
            FROM dbo.Evidence E
            INNER JOIN CFBase CF
                ON CF.CaseFileId = E.CaseFileId
            WHERE E.IsActive = 1
            GROUP BY E.CaseFileId
        ),
        LastHistory AS
        (
            SELECT
                H.CaseFileId,
                H.CaseStatusId          AS LastStatusId,
                H.DateCreated           AS LastStatusDate,
                H.ChangedByUserId       AS LastChangedByUserId
            FROM dbo.CaseStatusHistory H
            INNER JOIN
            (
                SELECT 
                    H2.CaseFileId,
                    MAX(H2.DateCreated) AS MaxDate
                FROM dbo.CaseStatusHistory H2
                WHERE H2.IsActive = 1
                GROUP BY H2.CaseFileId
            ) X
                ON X.CaseFileId = H.CaseFileId
               AND X.MaxDate    = H.DateCreated
            INNER JOIN CFBase CF
                ON CF.CaseFileId = H.CaseFileId
            WHERE H.IsActive = 1
        )

        /* ------------------------------------------------------
							Detalle por expediente
           ------------------------------------------------------ */

        SELECT
            CF.CaseFileId,
            CF.CaseNumber,
            CF.DescriptionCase,
            CF.ProsecutorOffice,
            CF.CreatedByUserId,
            U.FirstName  AS CreatedByFirstName,
            U.LastName   AS CreatedByLastName,
            U.UserName   AS CreatedByUserName,
            CF.CaseStatusId                 AS CurrentStatusId,
            CS.NameCaseStatus               AS CurrentStatusName,
            CF.Observations,
            CF.IsActive,
            ISNULL(EA.EvidenceCount, 0)     AS EvidenceCount,
            LH.LastStatusId,
            CSL.NameCaseStatus              AS LastStatusName,
            LH.LastStatusDate,
            LH.LastChangedByUserId,
            UL.FirstName                    AS LastChangedByFirstName,
            UL.LastName                     AS LastChangedByLastName,
            UL.UserName                     AS LastChangedByUserName
        FROM CFBase B
        INNER JOIN dbo.CaseFiles CF
            ON CF.CaseFileId = B.CaseFileId
        INNER JOIN dbo.Users U
            ON U.UserId = CF.CreatedByUserId
        INNER JOIN dbo.Cat_CaseStatuses CS
            ON CS.CaseStatusId = CF.CaseStatusId
        LEFT JOIN EvidenceAgg EA
            ON EA.CaseFileId = CF.CaseFileId
        LEFT JOIN LastHistory LH
            ON LH.CaseFileId = CF.CaseFileId
        LEFT JOIN dbo.Cat_CaseStatuses CSL
            ON CSL.CaseStatusId = LH.LastStatusId
        LEFT JOIN dbo.Users UL
            ON UL.UserId = LH.LastChangedByUserId
        ORDER BY
            CF.DateCreated DESC,
            CF.CaseFileId DESC;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        ;THROW;
    END CATCH;
END
GO
