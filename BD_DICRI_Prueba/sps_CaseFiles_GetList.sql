/* ==============================================================
    SP:             [dbo].[sps_CaseFiles_GetList]
    Propósito:      Obtiene el listado de expedientes con soporte de filtros y paginación.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_CaseFiles_GetList]
    @CaseStatusId     INT           = NULL,
    @CreatedByUserId  INT           = NULL,
    @FromDate         DATETIME      = NULL,
    @ToDate           DATETIME      = NULL,
    @Page             INT           = 1,
    @PageSize         INT           = 20,
    @Token            NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        --------------------------------------------------------
        --		Normalizar parámetros de paginación
        --------------------------------------------------------
        IF @Page IS NULL OR @Page < 1
            SET @Page = 1;

        IF @PageSize IS NULL OR @PageSize <= 0
            SET @PageSize = 20;

        --------------------------------------------------------
        --						EXPEDIENTES
        --------------------------------------------------------
        ;WITH CaseFilesFiltered AS
        (
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
                ISNULL(Ev.EvidenceCount, 0) AS EvidenceCount,
                ROW_NUMBER() OVER (
                    ORDER BY CF.DateCreated DESC, CF.CaseFileId DESC
                ) AS RowNum,
                COUNT(1) OVER() AS TotalRows
            FROM dbo.CaseFiles CF
            INNER JOIN dbo.Users U
                ON U.UserId = CF.CreatedByUserId
            INNER JOIN dbo.Cat_CaseStatuses CS
                ON CS.CaseStatusId = CF.CaseStatusId
            LEFT JOIN (
                SELECT 
                    E.CaseFileId,
                    COUNT(1) AS EvidenceCount
                FROM dbo.Evidence E
                WHERE E.IsActive = 1
                GROUP BY E.CaseFileId
            ) Ev
                ON Ev.CaseFileId = CF.CaseFileId
            WHERE 
                CF.IsActive = 1
                AND ( @CaseStatusId IS NULL OR CF.CaseStatusId = @CaseStatusId )
                AND ( @CreatedByUserId IS NULL OR CF.CreatedByUserId = @CreatedByUserId )
                AND ( @FromDate IS NULL OR CF.DateCreated >= @FromDate )
                AND ( @ToDate IS NULL  OR CF.DateCreated < DATEADD(DAY, 1, @ToDate) )
        )
        SELECT
            CF.CaseFileId,
            CF.CaseNumber,
            CF.DescriptionCase,
            CF.ProsecutorOffice,
            CF.CreatedByUserId,
            CF.CreatedByFirstName,
            CF.CreatedByLastName,
            CF.CreatedByUserName,
            CF.CaseStatusId,
            CF.NameCaseStatus,
            CF.Observations,
            CF.EvidenceCount,
            CF.TotalRows
        FROM CaseFilesFiltered CF
        WHERE CF.RowNum BETWEEN ((@Page - 1) * @PageSize + 1) AND (@Page * @PageSize)
        ORDER BY CF.RowNum;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        ;THROW;
    END CATCH;
END
GO
