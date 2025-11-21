/* ==============================================================
    SP:             [dbo].[sps_Users_UpdateStatus]
    Propósito:      Actualiza el estado activo/inactivo de un usuario.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Users_UpdateStatus]
    @UserId    INT,
    @IsActive  BIT,
    @TokenUpdated     NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        IF @UserId IS NULL
        BEGIN
            RAISERROR('El usuario es obligatorio.', 16, 1);
        END

        IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE UserId = @UserId)
        BEGIN
            RAISERROR('El usuario especificado no existe.', 16, 1);
        END

        --------------------------------------------------------
        --			Actualizar estado del usuario
        --------------------------------------------------------
        UPDATE U
        SET 
            U.IsActive     = @IsActive,
            U.TokenUpdated = @TokenUpdated,
            U.DateUpdated  = GETDATE()
        FROM dbo.Users U
        WHERE U.UserId = @UserId;

        --------------------------------------------------------
        --			Devolver información usuario
        --------------------------------------------------------
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
            ON UR.UserId   = U.UserId AND UR.IsActive = 1
        LEFT JOIN dbo.Roles R
            ON R.RoleId    = UR.RoleId AND R.IsActive  = 1
        WHERE U.UserId = @UserId;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;

        ;THROW;
    END CATCH;
END
GO
