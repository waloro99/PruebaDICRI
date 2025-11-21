/* ==============================================================
    SP:             [dbo].[sps_Auth_GetUserProfile]
    Propósito:      Obtiene la información del perfil del usuario a partir del UserId.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Auth_GetUserProfile]
    @UserId INT,
    @Token  NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        IF @UserId IS NULL
        BEGIN
            RAISERROR('El parámetro @UserId es obligatorio.', 16, 1);
        END

        IF NOT EXISTS (
            SELECT 1 FROM dbo.Users U
            WHERE U.UserId   = @UserId AND U.IsActive = 1
        )
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
            ON UR.UserId   = U.UserId
           AND UR.IsActive = 1
        LEFT JOIN dbo.Roles R
            ON R.RoleId    = UR.RoleId
           AND R.IsActive  = 1
        WHERE U.UserId = @UserId;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        ;THROW;
    END CATCH;
END
GO
