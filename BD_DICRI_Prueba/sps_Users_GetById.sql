/* ==============================================================
	SP:				[dbo].[sps_Users_GetById]
	Propósito:		Obtiene la información de un usuario específico, incluyendo los roles asignados.
	Autor:			Walter Orozco
	Fecha:			20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Users_GetById]
	@UserId INT,
	@Token  NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY

		IF @UserId IS NULL
		BEGIN
			RAISERROR('El usuario es obligatorio.', 16, 1);
		END

		IF NOT EXISTS (
			SELECT 1 FROM dbo.Users
			WHERE UserId = @UserId AND IsActive = 1
		)
		BEGIN

			SELECT 
				CAST(NULL AS INT)             AS UserId,
				CAST(NULL AS NVARCHAR(100))   AS FirstName,
				CAST(NULL AS NVARCHAR(100))   AS LastName,
				CAST(NULL AS NVARCHAR(50))    AS UserName,
				CAST(NULL AS NVARCHAR(150))   AS Email,
				CAST(NULL AS NVARCHAR(20))    AS PhoneNumber,
				CAST(NULL AS BIT)             AS IsActive,
				CAST(NULL AS NVARCHAR(100))   AS TokenCreated,
				CAST(NULL AS DATETIME)        AS DateCreated,
				CAST(NULL AS NVARCHAR(100))   AS TokenUpdated,
				CAST(NULL AS DATETIME)        AS DateUpdated,
				CAST(NULL AS INT)             AS RoleId,
				CAST(NULL AS NVARCHAR(50))    AS NameRole;

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
			UR.RoleId,
			R.NameRole
		FROM dbo.Users U
        INNER JOIN dbo.UserRole UR
            ON UR.UserId   = U.UserId 
        INNER JOIN dbo.Roles R
            ON R.RoleId    = UR.RoleId 
        WHERE U.UserId = @UserId AND UR.IsActive = 1 AND R.IsActive  = 1;

	END TRY
	BEGIN CATCH
		DECLARE @ErrorMessage NVARCHAR(4000);
		SELECT @ErrorMessage = ERROR_MESSAGE();
		PRINT 'Error: ' + @ErrorMessage;
		;THROW;
	END CATCH;
END
GO
