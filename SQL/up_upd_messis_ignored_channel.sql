/*************************************************************************************
PURPOSE:        Update/insert procedure for messis ignored channel
HISTORY:        07.07.2019 - Raybarg
NOTES:
**************************************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[up_upd_messis_ignored_channel]') AND objectproperty(id, N'ISPROCEDURE') = 1)
DROP PROCEDURE [dbo].[up_upd_messis_ignored_channel]
go

CREATE PROCEDURE [dbo].[up_upd_messis_ignored_channel]
	@iMessis_ignored_channel_id INT OUTPUT,
	@strDiscord_Channel_id nvarchar(50)
as
	DECLARE @iID INT = 0
	SELECT @iID = messis_ignored_channel_id FROM messis_ignored_channels WHERE discord_channel_id = @strDiscord_Channel_id

	-- Delete if it exists, otherwise add
	IF ISNULL(@iID, 0) > 0 BEGIN
		DELETE FROM messis_ignored_channels WHERE messis_ignored_channel_id = @iID
	END ELSE BEGIN
		INSERT INTO messis_ignored_channels(
			discord_channel_id
			)
		VALUES(
			@strDiscord_Channel_id
			)
	END

	-- Haetaan luotu oma identity
	SET @iMessis_ignored_channel_id = scope_identity()
GO
