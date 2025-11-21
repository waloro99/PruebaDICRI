/* ==============================================================
    SP:             [dbo].[sps_Evidence_Insert]
    Propósito:      Crea un nuevo indicio asociado a un expediente específico.
    Autor:          Walter Orozco
    Fecha:          20/11/2025
============================================================== */
CREATE PROCEDURE [dbo].[sps_Evidence_Insert]
    @CaseFileId         INT,
    @EvidenceCode       NVARCHAR(50),
    @DescriptionEvidence NVARCHAR(500),
    @EvidenceTypeId     INT,
    @Color              NVARCHAR(50)   = NULL,
    @SizeDescription    NVARCHAR(100)  = NULL,
    @WeightDescription  DECIMAL(10,3)  = NULL,
    @FoundLocation      NVARCHAR(200)  = NULL,
    @CurrentLocation    NVARCHAR(200)  = NULL,
    @CreatedByUserId    INT,
    @Observations       NVARCHAR(500)  = NULL,
    @TokenCreated       NVARCHAR(200)  = 'SYS-SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        --------------------------------------------------------
        --		Validaciones básicas
        --------------------------------------------------------

        -- Expediente debe existir y estar activo
        IF NOT EXISTS (
            SELECT 1 FROM dbo.CaseFiles CF
            WHERE CF.CaseFileId = @CaseFileId AND CF.IsActive = 1
        )
        BEGIN
            RAISERROR('El expediente especificado no existe o no está activo.', 16, 1);
        END

        IF NOT EXISTS (
            SELECT 1 FROM dbo.Users U
            WHERE U.UserId = @CreatedByUserId AND U.IsActive = 1
        )
        BEGIN
            RAISERROR('El usuario que registra la evidencia no existe o no está activo.', 16, 1);
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
            WHERE E.CaseFileId   = @CaseFileId AND E.EvidenceCode = @EvidenceCode
        )
        BEGIN
            RAISERROR('Ya existe una evidencia con el mismo código para este expediente.', 16, 1);
        END

        --------------------------------------------------------
        --		Insertar evidencia
        --------------------------------------------------------
        DECLARE @NewEvidenceId INT;

        INSERT INTO dbo.Evidence
        (
            CaseFileId,
            EvidenceCode,
            DescriptionEvidence,
            EvidenceTypeId,
            Color,
            SizeDescription,
            WeightDescription,
            FoundLocation,
            CurrentLocation,
            CreatedByUserId,
            Observations,
            IsActive,
            TokenCreated,
            DateCreated
        )
        VALUES
        (
            @CaseFileId,
            @EvidenceCode,
            @DescriptionEvidence,
            @EvidenceTypeId,
            @Color,
            @SizeDescription,
            @WeightDescription,
            @FoundLocation,
            @CurrentLocation,
            @CreatedByUserId,
            @Observations,
            1,
            @TokenCreated,
            GETDATE()
        );

        SET @NewEvidenceId = SCOPE_IDENTITY();

        --------------------------------------------------------
        -- 3. Devolver evidencia creada
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
        WHERE E.EvidenceId = @NewEvidenceId;

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
