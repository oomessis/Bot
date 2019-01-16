/*************************************************************************************
PURPOSE:        Wordcount select procedure
HISTORY:        16.1.2019 - Raybarg
NOTES:
**************************************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[dbo].[up_sel_wordcount]') AND objectproperty(id, N'ISPROCEDURE') = 1)
	DROP PROCEDURE [dbo].[up_sel_wordcount]
GO

CREATE PROCEDURE [dbo].[up_sel_wordcount]
	@strSearch nvarchar(200)
AS
	;with cte as (
	select
		dbo.GetSubstringCount(message_text, @strSearch) as cnt,
		channel_id
	from
		discord_messages
	)
	select sum(cnt) as cnt, channel_name from cte
	inner join discord_channels on cte.channel_id = discord_channels.channel_id
	group by channel_name
GO
