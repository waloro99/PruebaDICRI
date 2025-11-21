/* ==============================================================
    SP:             [dbo].[sps_CaseFiles_GetHistory]
    Propósito:      Obtiene el historial de cambios de estado de un expediente.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_CaseFiles_GetHistory]
    @CaseFileId INT,
    @Token      NVARCHAR(200) = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY

        --------------------------------------------------------
        --				Validaciones básicas
        --------------------------------------------------------
        IF @CaseFileId IS NULL
        BEGIN
            RAISERROR('El expediente es obligatorio.', 16, 1);
        END

        IF NOT EXISTS (
            SELECT 1 FROM dbo.CaseFiles CF
            WHERE CF.CaseFileId = @CaseFileId AND CF.IsActive = 1
        )
        BEGIN
            RAISERROR('El expediente especificado no existe o no está activo.', 16, 1);
        END

        --------------------------------------------------------
        --	Devolver historial de estados del expediente
        --------------------------------------------------------
        SELECT
            H.CaseStatusHistoryId,
            H.CaseFileId,
            H.CaseStatusId,
            CS.NameCaseStatus,
            H.ChangedByUserId,
            U.FirstName   AS ChangedByFirstName,
            U.LastName    AS ChangedByLastName,
            U.UserName    AS ChangedByUserName,
            H.Observations
        FROM dbo.CaseStatusHistory H
        INNER JOIN dbo.Cat_CaseStatuses CS
            ON CS.CaseStatusId = H.CaseStatusId
        INNER JOIN dbo.Users U
            ON U.UserId = H.ChangedByUserId
        WHERE H.CaseFileId = @CaseFileId
          AND H.IsActive   = 1
        ORDER BY
            H.DateCreated ASC,
            H.CaseStatusHistoryId ASC;

    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000);
        SELECT @ErrorMessage = ERROR_MESSAGE();
        PRINT 'Error: ' + @ErrorMessage;
        ;THROW;
    END CATCH;
END
GO
