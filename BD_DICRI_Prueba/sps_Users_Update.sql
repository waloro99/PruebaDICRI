/* ==============================================================
    SP:             [dbo].[sps_Users_Update]
    Propósito:      Actualiza la información de un usuario y opcionalmente sus roles.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Users_Update]
    @UserId        INT,
    @FirstName     NVARCHAR(100),
    @LastName      NVARCHAR(100),
    @UserName      NVARCHAR(50),
    @Email         NVARCHAR(150),
    @PhoneNumber   NVARCHAR(20)    = NULL,
    @Password	   NVARCHAR(255)   = NULL,
    @IsActive      BIT             = 1,
    @RoleIds       NVARCHAR(MAX)   = NULL,
    @TokenUpdated  NVARCHAR(200)   = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Usuario debe existir
        IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE UserId = @UserId)
        BEGIN
            RAISERROR('El usuario especificado no existe.', 16, 1);
        END

        -- UserName único
        IF EXISTS (
            SELECT 1 FROM dbo.Users WHERE UserName = @UserName AND UserId <> @UserId
        )
        BEGIN
            RAISERROR('El nombre de usuario ya existe para otro usuario.', 16, 1);
        END

        --------------------------------------------------------
        --			Actualizar datos del usuario
        --------------------------------------------------------
        UPDATE U
        SET
            U.FirstName    = @FirstName,
            U.LastName     = @LastName,
            U.UserName     = @UserName,
            U.Email        = @Email,
            U.PhoneNumber  = @PhoneNumber,
            U.IsActive     = @IsActive,
            U.TokenUpdated = @TokenUpdated,
            U.DateUpdated  = GETDATE(),
            U.PasswordUser = CASE 
                                WHEN @Password IS NOT NULL AND LTRIM(RTRIM(@Password)) <> '' 
                                THEN @Password
                                ELSE U.PasswordUser
                             END
        FROM dbo.Users U
        WHERE U.UserId = @UserId;

        --------------------------------------------------------
        --					Actualizar roles
        --------------------------------------------------------
        IF @RoleIds IS NOT NULL AND LTRIM(RTRIM(@RoleIds)) <> ''
        BEGIN
            DECLARE @Roles TABLE (RoleId INT PRIMARY KEY);

            ;WITH Parsed AS (
                SELECT DISTINCT
                       CAST(LTRIM(RTRIM(value)) AS INT) AS RoleId
                FROM STRING_SPLIT(@RoleIds, ',')
                WHERE LTRIM(RTRIM(value)) <> ''
            )
            INSERT INTO @Roles(RoleId)
            SELECT RoleId
            FROM Parsed;

            IF NOT EXISTS (SELECT 1 FROM @Roles)
            BEGIN
                RAISERROR('La lista de roles proporcionada está vacía o no es válida.', 16, 1);
            END

            -- Desactivar todos los roles actuales del usuario
            UPDATE UR
            SET UR.IsActive     = 0,
                UR.TokenUpdated = @TokenUpdated,
                UR.DateUpdated  = GETDATE()
            FROM dbo.UserRole UR
            WHERE UR.UserId = @UserId
              AND UR.IsActive = 1;

            -- Reactivar roles ya existentes en UserRole
            UPDATE UR
            SET UR.IsActive     = 1,
                UR.TokenUpdated = @TokenUpdated,
                UR.DateUpdated  = GETDATE()
            FROM dbo.UserRole UR
            INNER JOIN @Roles R ON R.RoleId = UR.RoleId
            WHERE UR.UserId = @UserId;

            -- Insertar roles nuevos que no existían para este usuario
            INSERT INTO dbo.UserRole
            (
                UserId,
                RoleId,
                IsActive,
                TokenCreated,
                DateCreated
            )
            SELECT
                @UserId,
                R.RoleId,
                1,
                @TokenUpdated,
                GETDATE()
            FROM @Roles R
            WHERE NOT EXISTS (
                SELECT 1 FROM dbo.UserRole UR
                WHERE UR.UserId = @UserId AND UR.RoleId = R.RoleId
            );
        END

        --------------------------------------------------------
        --			Devolver usuario actualizado
        --------------------------------------------------------
        SELECT 
            U.UserId,
            U.FirstName,
            U.LastName,
            U.UserName,
            U.Email,
            U.PhoneNumber,
            U.IsActive,
            U.TokenCreated,
            U.DateCreated,
            U.TokenUpdated,
            U.DateUpdated,
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
