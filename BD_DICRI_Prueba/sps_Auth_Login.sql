/* ==============================================================
    SP:             [dbo].[sps_Auth_Login]
    Propósito:      Valida las credenciales del usuario y devuelve su información básica junto con los roles asignados.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Auth_Login]
    @UserName   NVARCHAR(50),
    @Password   NVARCHAR(255),
    @Token      NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        DECLARE @UserId INT;

        SELECT
            @UserId = U.UserId
        FROM dbo.Users U
        WHERE U.UserName     = @UserName
          AND U.PasswordUser = @Password
          AND U.IsActive     = 1;

        -- Si no existe usuario válido
        IF @UserId IS NULL
        BEGIN
            SELECT 
                CAST(NULL AS INT)            AS UserId,
                CAST(NULL AS NVARCHAR(100))  AS FirstName,
                CAST(NULL AS NVARCHAR(100))  AS LastName,
                CAST(NULL AS NVARCHAR(50))   AS UserName,
                CAST(NULL AS NVARCHAR(150))  AS Email,
                CAST(NULL AS NVARCHAR(20))   AS PhoneNumber,
                CAST(NULL AS BIT)            AS IsActive,
                CAST(NULL AS INT)            AS RoleId,
                CAST(NULL AS NVARCHAR(50))   AS NameRole;

            RETURN;
        END

        -- Devolver datos del usuario
        SELECT 
            U.UserId,
            U.FirstName,
            U.LastName,
            U.UserName,
            U.Email,
            U.PhoneNumber,
            U.IsActive,
            UR.RoleId,
            R.NameRole
        FROM dbo.Users U
        LEFT JOIN dbo.UserRole UR
            ON UR.UserId  = U.UserId
           AND UR.IsActive = 1
        LEFT JOIN dbo.Roles R
            ON R.RoleId   = UR.RoleId
           AND R.IsActive = 1
        WHERE U.UserId = @UserId;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
    END CATCH;
END
GO
