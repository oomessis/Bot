/*************************************************************************************
PURPOSE:        Update/insert procedure for discord message
HISTORY:        27.10.2018 - Raybarg
NOTES:
**************************************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[up_upd_discord_messages]') AND objectproperty(id, N'ISPROCEDURE') = 1)
DROP PROCEDURE [dbo].[up_upd_discord_messages]
go

CREATE PROCEDURE [dbo].[up_upd_discord_messages]
	@iDiscord_message_id INT OUTPUT,
	@iServer_id nvarchar(50),
	@iChannel_id nvarchar(50),
	@iMessage_id nvarchar(50),
	@dtMessage_date datetime,
	@strPerson_name nvarchar(50),
	@strMessage_json nvarchar(max)
as

	UPDATE discord_messages SET
		server_id=@iServer_id,
		channel_id=@iChannel_id,
		message_id=@iMessage_id,
		message_date=@dtMessage_date,
		person_name=@strPerson_name,
		message_json=@strMessage_json
	where message_id = @iMessage_id

	IF @@rowcount = 0 BEGIN
		INSERT INTO discord_messages(
			server_id,
			channel_id,
			message_id,
			message_date,
			person_name,
			message_json
			)
		VALUES(
			@iServer_id,
			@iChannel_id,
			@iMessage_id,
			@dtMessage_date,
			@strPerson_name,
			@strMessage_json
			)

		-- Haetaan luotu oma identity
		SET @iDiscord_message_id = scope_identity()
	END
GO
