/* ==============================================================
    SP:             [dbo].[sps_Evidence_Update]
    Propósito:      Actualiza la información de una evidencia existente.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Evidence_Update]
    @EvidenceId         INT,
    @EvidenceCode       NVARCHAR(50),
    @DescriptionEvidence NVARCHAR(500),
    @EvidenceTypeId     INT,
    @Color              NVARCHAR(50)   = NULL,
    @SizeDescription    NVARCHAR(100)  = NULL,
    @WeightDescription  DECIMAL(10,3)  = NULL,
    @FoundLocation      NVARCHAR(200)  = NULL,
    @CurrentLocation    NVARCHAR(200)  = NULL,
    @Observations       NVARCHAR(500)  = NULL,
	@UpdatedByUserId	INT,
    @TokenUpdated       NVARCHAR(200)  = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        --------------------------------------------------------
        --		Validaciones básicas y datos actuales
        --------------------------------------------------------
        IF @EvidenceId IS NULL
        BEGIN
            RAISERROR('El indicio es obligatorio.', 16, 1);
        END

        DECLARE @CaseFileId INT, @CreatedByUserId INT;

        SELECT 
            @CaseFileId      = E.CaseFileId,
            @CreatedByUserId = E.CreatedByUserId
        FROM dbo.Evidence E
        WHERE E.EvidenceId = @EvidenceId AND E.IsActive = 1;

        IF @CaseFileId IS NULL
        BEGIN
            RAISERROR('La evidencia especificada no existe o no está activa.', 16, 1);
        END

        IF NOT EXISTS (
            SELECT 1 FROM dbo.CaseFiles CF
            WHERE CF.CaseFileId = @CaseFileId AND CF.IsActive = 1
        )
        BEGIN
            RAISERROR('El expediente asociado a la evidencia no existe o no está activo.', 16, 1);
        END

        IF NOT EXISTS (
            SELECT 1 FROM dbo.Cat_EvidenceTypes ET
            WHERE ET.EvidenceTypeId = @EvidenceTypeId AND ET.IsActive = 1
        )
        BEGIN
            RAISERROR('El tipo de evidencia especificado no existe o no está activo.', 16, 1);
        END

        IF EXISTS (
            SELECT 1 FROM dbo.Evidence E
            WHERE E.CaseFileId   = @CaseFileId AND E.EvidenceCode = @EvidenceCode AND E.EvidenceId  <> @EvidenceId
        )
        BEGIN
            RAISERROR('Ya existe otra evidencia con el mismo código para este expediente.', 16, 1);
        END

        --------------------------------------------------------
        --				Actualizar evidencia
        --------------------------------------------------------
        UPDATE E
        SET
            E.EvidenceCode       = @EvidenceCode,
            E.DescriptionEvidence= @DescriptionEvidence,
            E.EvidenceTypeId     = @EvidenceTypeId,
            E.Color              = @Color,
            E.SizeDescription    = @SizeDescription,
            E.WeightDescription  = @WeightDescription,
            E.FoundLocation      = @FoundLocation,
            E.CurrentLocation    = @CurrentLocation,
            E.Observations       = @Observations,
			E.CreatedByUserId	 = @UpdatedByUserId,
            E.TokenUpdated       = @TokenUpdated,
            E.DateUpdated        = GETDATE()
        FROM dbo.Evidence E
        WHERE E.EvidenceId = @EvidenceId;

        --------------------------------------------------------
        --			Devolver evidencia actualizada
        --------------------------------------------------------
        SELECT
            E.EvidenceId,
            E.CaseFileId,
            CF.CaseNumber,
            E.EvidenceCode,
            E.DescriptionEvidence,
            E.EvidenceTypeId,
            ET.NameEvidenceType,
            E.Color,
            E.SizeDescription,
            E.WeightDescription,
            E.FoundLocation,
            E.CurrentLocation,
            E.CreatedByUserId,
            U.FirstName  AS CreatedByFirstName,
            U.LastName   AS CreatedByLastName,
            U.UserName   AS CreatedByUserName,
            E.Observations
        FROM dbo.Evidence E
        INNER JOIN dbo.CaseFiles CF
            ON CF.CaseFileId = E.CaseFileId
        INNER JOIN dbo.Cat_EvidenceTypes ET
            ON ET.EvidenceTypeId = E.EvidenceTypeId
        INNER JOIN dbo.Users U
            ON U.UserId = E.CreatedByUserId
        WHERE E.EvidenceId = @EvidenceId;

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
