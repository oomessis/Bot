/*************************************************************************************
PURPOSE:        Update/insert procedure for parrot
HISTORY:        14.1.2019 - Raybarg
NOTES:
**************************************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[up_upd_parrot]') AND objectproperty(id, N'ISPROCEDURE') = 1)
DROP PROCEDURE [dbo].[up_upd_parrot]
go

CREATE PROCEDURE [dbo].[up_upd_parrot]
	@iParrot_id INT OUTPUT,
	@iUser_id nvarchar(50),
	@iMessage_id nvarchar(50),
	@dtMessage_date datetime,
	@strPerson_name nvarchar(50),
	@strMessage_text nvarchar(2000),
	@strMessage_url nvarchar(200),
	@iChannel_id nvarchar(50)
as

	UPDATE parrots SET
		[user_id]=@iUser_id,
		message_id=@iMessage_id,
		message_date=@dtMessage_date,
		person_name=@strPerson_name,
		message_text=@strMessage_text,
		message_url=@strMessage_url,
		channel_id=@iChannel_id
	where [user_id] = @iUser_id and message_id = @iMessage_id

	IF @@rowcount = 0 BEGIN
		INSERT INTO parrots(
			[user_id],
			message_id,
			message_date,
			person_name,
			message_text,
			message_url,
			channel_id
			)
		VALUES(
			@iUser_id,
			@iMessage_id,
			@dtMessage_date,
			@strPerson_name,
			@strMessage_text,
			@strMessage_url,
			@iChannel_id
			)

		-- Haetaan luotu oma identity
		SET @iParrot_id = scope_identity()
	END
GO
