/*************************************************************************************
PURPOSE:        Update/insert procedure for messis user tag
HISTORY:        19.06.2019 - Raybarg
NOTES:
**************************************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[up_add_messis_user_tags]') AND objectproperty(id, N'ISPROCEDURE') = 1)
DROP PROCEDURE [dbo].[up_add_messis_user_tags]
go

CREATE PROCEDURE [dbo].[up_add_messis_user_tags]
	@iMessis_user_id nvarchar(50),
	@strTags nvarchar(MAX)
as

	INSERT INTO messis_users_tags(
		messis_user_id,
		tag
		)
		SELECT @iMessis_user_id, CAST([value] AS nvarchar) FROM dbo.split(@strTags, ',') WHERE [value] <> ''

GO
