/*************************************************************************************
PURPOSE:        Update/insert procedure for messis user tag
HISTORY:        19.06.2019 - Raybarg
NOTES:
**************************************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[up_upd_messis_user_tag]') AND objectproperty(id, N'ISPROCEDURE') = 1)
DROP PROCEDURE [dbo].[up_upd_messis_user_tag]
go

CREATE PROCEDURE [dbo].[up_upd_messis_user_tag]
	@iMessis_users_tag_id INT OUTPUT,
	@iMessis_user_id nvarchar(50),
	@strTag nvarchar(50)
as

	UPDATE messis_users_tags SET
		messis_user_id=@iMessis_user_id,
		tag=@strTag
		
	where messis_users_tag_id = @iMessis_users_tag_id

	IF @@rowcount = 0 BEGIN
		INSERT INTO messis_users_tags(
			messis_user_id,
			tag
			)
		VALUES(
			@iMessis_user_id,
			@strTag
			)

		-- Haetaan luotu oma identity
		SET @iMessis_users_tag_id = scope_identity()
	END
GO
