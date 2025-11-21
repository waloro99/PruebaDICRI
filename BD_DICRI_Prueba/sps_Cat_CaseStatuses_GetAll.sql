/* ==============================================================
    SP:             [dbo].[sps_Cat_CaseStatuses_GetAll]
    Propósito:      Obtiene el listado de estados de expediente configurados en el catálogo.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Cat_CaseStatuses_GetAll]
    @Token NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        SELECT
            cs.CaseStatusId,
            cs.NameCaseStatus,
            cs.DescriptionCaseStatus
        FROM dbo.Cat_CaseStatuses cs
        WHERE cs.IsActive = 1
        ORDER BY cs.NameCaseStatus;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        ;THROW;
    END CATCH;
END
GO
