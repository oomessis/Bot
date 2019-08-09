/*************************************************************************************
PURPOSE:        Update/insert procedure for messis user tag
HISTORY:        19.06.2019 - Raybarg
NOTES:
**************************************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[up_upd_messis_user_tag_2]') AND objectproperty(id, N'ISPROCEDURE') = 1)
DROP PROCEDURE [dbo].[up_upd_messis_user_tag_2]
go

CREATE PROCEDURE [dbo].[up_upd_messis_user_tag_2]
	@strDiscordID nvarchar(50),
	@strTag nvarchar(50)
as

	DECLARE @iUserID INT
	SET @iUserID = (SELECT messis_user_id FROM messis_users WHERE discord_user_id = @strDiscordID)

	UPDATE messis_users_tags SET
		messis_user_id=@iUserID,
		tag=@strTag
		
	where messis_user_id = @iUserID and tag=@strTag

	IF @@rowcount = 0 BEGIN
		INSERT INTO messis_users_tags(
			messis_user_id,
			tag
			)
		VALUES(
			@iUserID,
			@strTag
			)

	END
GO
