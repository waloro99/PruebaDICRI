/* ==============================================================
    SP:             [dbo].[sps_Roles_GetAll]
    Propósito:      Obtiene el listado de roles configurados en el sistema.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Roles_GetAll]
    @Token NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        SELECT
            R.RoleId,
            R.NameRole,
            R.DescriptionRole
        FROM dbo.Roles R
        WHERE R.IsActive = 1
        ORDER BY R.NameRole;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        ;THROW;
    END CATCH;
END
GO
