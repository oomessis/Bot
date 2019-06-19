/*************************************************************************************
PURPOSE:        Update/insert procedure for messis user
HISTORY:        19.06.2019 - Raybarg
NOTES:
**************************************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[up_upd_messis_user]') AND objectproperty(id, N'ISPROCEDURE') = 1)
DROP PROCEDURE [dbo].[up_upd_messis_user]
go

CREATE PROCEDURE [dbo].[up_upd_messis_user]
	@iMessis_user_id INT OUTPUT,
	@strDiscord_User_id nvarchar(50),
	@strDiscord_User_name nvarchar(50)
as

	UPDATE messis_users SET
		discord_user_id=@strDiscord_User_id,
		discord_user_name=@strDiscord_User_name
		
	where discord_user_id = @strDiscord_User_id

	IF @@rowcount = 0 BEGIN
		INSERT INTO messis_users(
			discord_user_id,
			discord_user_name
			)
		VALUES(
			@strDiscord_User_id,
			@strDiscord_User_name
			)

		-- Haetaan luotu oma identity
		SET @iMessis_user_id = scope_identity()
	END
GO
