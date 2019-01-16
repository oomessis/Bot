/*************************************************************************************
PURPOSE:        Update/insert procedure for discord message
HISTORY:        27.10.2018 - Raybarg
NOTES:
**************************************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[f_GetSubstringCount]') AND objectproperty(id, N'IsScalarFunction') = 1)
	DROP FUNCTION [dbo].[f_GetSubstringCount]
GO
CREATE FUNCTION [dbo].[f_GetSubstringCount]
(
  @Input nvarchar(2000),
  @Search NVARCHAR(200)
)
RETURNS INT
AS
BEGIN 
    DECLARE @SearhLength AS INT = LEN('-' + @Search + '-') -2;
    DECLARE @conteinerIndex AS INT = 255;
    DECLARE @conteiner AS CHAR(1) = CHAR(@conteinerIndex);
    WHILE ((CHARINDEX(@conteiner, @Search)>0) AND (@conteinerIndex>0))
    BEGIN
        SET @conteinerIndex = @conteinerIndex-1;
        SET @conteiner = CHAR(@conteinerIndex);
    END;
    SET @Input = @conteiner + @Input + @conteiner
    RETURN (LEN(@Input) - LEN(REPLACE(@Input, @Search, ''))) / @SearhLength
END
