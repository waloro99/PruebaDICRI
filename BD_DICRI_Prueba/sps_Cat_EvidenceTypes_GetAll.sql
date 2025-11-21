/* ==============================================================
    SP:             [dbo].[sps_Cat_EvidenceTypes_GetAll]
    Propósito:      Obtiene el listado de tipos de evidencia configurados en el catálogo.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Cat_EvidenceTypes_GetAll]
    @Token NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        SELECT
            et.EvidenceTypeId,
            et.NameEvidenceType,
            et.DescriptionEvidenceType
        FROM dbo.Cat_EvidenceTypes et
        WHERE et.IsActive = 1
        ORDER BY et.NameEvidenceType;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        ;THROW;
    END CATCH;
END
GO
