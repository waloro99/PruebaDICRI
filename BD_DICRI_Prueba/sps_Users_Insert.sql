/* ==============================================================
    SP:             [dbo].[sps_Users_Insert]
    Propósito:      Crea un nuevo usuario en el sistema y le asigna uno o varios roles.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Users_Insert]
    @FirstName      NVARCHAR(100),
    @LastName       NVARCHAR(100),
    @UserName       NVARCHAR(50),
    @Email          NVARCHAR(150),
    @PhoneNumber    NVARCHAR(20)    = NULL,
    @Password		NVARCHAR(255),
    @RoleIds        NVARCHAR(MAX)   = NULL,
    @TokenCreated   NVARCHAR(200)   = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- UserName único
        IF EXISTS (SELECT 1 FROM dbo.Users WHERE UserName = @UserName)
        BEGIN
            RAISERROR('El nombre de usuario ya existe.', 16, 1);
        END

        --------------------------------------------------------
        --				Procesar lista de roles
        --------------------------------------------------------
        DECLARE @Roles TABLE (
            RoleId INT PRIMARY KEY
        );

        IF @RoleIds IS NULL OR LTRIM(RTRIM(@RoleIds)) = ''
        BEGIN
            INSERT INTO @Roles(RoleId)
            SELECT R.RoleId
            FROM dbo.Roles R
            WHERE R.NameRole = 'TECHNICIAN' AND R.IsActive = 1;

            IF NOT EXISTS (SELECT 1 FROM @Roles)
            BEGIN
                RAISERROR('No se encontró el rol TECHNICIAN activo para asignación por defecto.', 16, 1);
            END
        END
        ELSE
        BEGIN

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

        END

        --------------------------------------------------------
        --					Insertar usuario
        --------------------------------------------------------
        DECLARE @NewUserId INT;

        INSERT INTO dbo.Users
        (
            FirstName,
            LastName,
            UserName,
            Email,
            PhoneNumber,
            PasswordUser,
            IsActive,
            TokenCreated,
            DateCreated
        )
        VALUES
        (
            @FirstName,
            @LastName,
            @UserName,
            @Email,
            @PhoneNumber,
            @Password,
            1,
            @TokenCreated,
            GETDATE()
        );

        SET @NewUserId = SCOPE_IDENTITY();

        --------------------------------------------------------
        --				Insertar roles del usuario
        --------------------------------------------------------
        INSERT INTO dbo.UserRole
        (
            UserId,
            RoleId,
            IsActive,
            TokenCreated,
            DateCreated
        )
        SELECT
            @NewUserId,
            R.RoleId,
            1,
            @TokenCreated,
            GETDATE()
        FROM @Roles R;

        --------------------------------------------------------
        --				Devolver usuario creado
        --------------------------------------------------------
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
        INNER JOIN dbo.UserRole UR
            ON UR.UserId   = U.UserId 
        INNER JOIN dbo.Roles R
            ON R.RoleId    = UR.RoleId 
        WHERE U.UserId = @NewUserId AND UR.IsActive = 1 AND R.IsActive  = 1;

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
