/*************************************************************************************
PURPOSE:        Update/insert procedure for badge
HISTORY:        28.4.2019 - Raybarg
NOTES:
**************************************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[up_upd_badge]') AND objectproperty(id, N'ISPROCEDURE') = 1)
DROP PROCEDURE [dbo].[up_upd_badge]
go

CREATE PROCEDURE [dbo].[up_upd_badge]
	@iBadge_id INT OUTPUT,
	@iBadge_type INT,
	@iGuild_id nvarchar(50),
	@iChannel_id nvarchar(50),
	@iMessage_id nvarchar(50),
	@iUser_id nvarchar(50),
	@strPerson_name nvarchar(50),
	@dtMessage_date datetime,
	@strMessage_url nvarchar(200)
as

	UPDATE messis_badges SET
		badge_type=@iBadge_type,
		guild_id=@iGuild_id,
		channel_id=@iChannel_id,
		message_id=@iMessage_id,
		[user_id]=@iUser_id,
		person_name=@strPerson_name,
		message_date=@dtMessage_date,
		message_url=@strMessage_url
		
	where [user_id] = @iUser_id and message_id = @iMessage_id and badge_type = @iBadge_type

	IF @@rowcount = 0 BEGIN
		INSERT INTO messis_badges(
			badge_type,
			guild_id,
			channel_id,
			message_id,
			[user_id],
			person_name,
			message_date,
			message_url
			)
		VALUES(
			@iBadge_type,
			@iGuild_id,
			@iChannel_id,
			@iMessage_id,
			@iUser_id,
			@strPerson_name,
			@dtMessage_date,
			@strMessage_url
			)

		-- Haetaan luotu oma identity
		SET @iBadge_type = scope_identity()
	END
GO
