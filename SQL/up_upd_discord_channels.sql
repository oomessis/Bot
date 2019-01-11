/*************************************************************************************
PURPOSE:        Update/insert procedure for discord channels
HISTORY:        11.1.2019 - Raybarg
NOTES:
**************************************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[up_upd_discord_channels]') AND objectproperty(id, N'ISPROCEDURE') = 1)
DROP PROCEDURE [dbo].[up_upd_discord_channels]
go

CREATE PROCEDURE [dbo].[up_upd_discord_channels]
	@iDiscord_channel_id INT OUTPUT,
	@iServer_id nvarchar(50),
	@iChannel_id nvarchar(50),
	@strChannel_name nvarchar(50),
	@bChannel_tracked bit
as

	UPDATE discord_channels SET
		server_id=@iServer_id,
		channel_id=@iChannel_id,
		channel_name=@strChannel_name,
		channel_tracked=@bChannel_tracked
	where channel_id = @iChannel_id

	IF @@rowcount = 0 BEGIN
		INSERT INTO discord_channels(
			server_id,
			channel_id,
			channel_name,
			channel_tracked
			)
		VALUES(
			@iServer_id,
			@iChannel_id,
			@strChannel_name,
			@bChannel_tracked
			)

		-- Haetaan luotu oma identity
		SET @iDiscord_channel_id = scope_identity()
	END
GO
