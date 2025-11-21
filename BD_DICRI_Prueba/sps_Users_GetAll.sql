/* ==============================================================
    SP:             [dbo].[sps_Users_GetAll]
    Propósito:      Obtiene el listado de usuarios del sistema, incluyendo los roles asignados.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Users_GetAll]
    @Token NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        SELECT 
            U.UserId,
            U.FirstName,
            U.LastName,
            U.UserName,
            U.Email,
            U.PhoneNumber,
            UR.RoleId,
            R.NameRole
        FROM dbo.Users U
        LEFT JOIN dbo.UserRole UR
            ON UR.UserId   = U.UserId AND UR.IsActive = 1
        LEFT JOIN dbo.Roles R
            ON R.RoleId    = UR.RoleId AND R.IsActive  = 1
        WHERE U.IsActive = 1
        ORDER BY U.UserName;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        ;THROW;
    END CATCH;
END
GO
