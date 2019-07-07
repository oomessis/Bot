/*********************************************************************
PURPOSE:        Establish table for Messis ignored channels (channels not part of the statistics)
HISTORY:        07.07.2019 - Raybarg
NOTES:          -
*********************************************************************/
--drop table messis_ignored_channels
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[messis_ignored_channels]') AND objectproperty(id, N'isusertable') =1)
BEGIN
	SET NOCOUNT ON
END
ELSE
BEGIN
	CREATE table [dbo].[messis_ignored_channels] (			
		[messis_ignored_channel_id] [int] IDENTITY(1,1) NOT NULL		-- Own identity
			CONSTRAINT pk_messis_ignored_channel_id PRIMARY KEY ,
		[discord_channel_id] nvarchar(50) NOT NULL			-- Discord channel ID
	) ON [primary]
END
GO
IF NOT EXISTS (SELECT *  FROM sys.indexes  WHERE name='index1' AND object_id = OBJECT_ID('[dbo].[messis_ignored_channels]'))
	CREATE NONCLUSTERED INDEX [index1] ON [dbo].[messis_ignored_channels] ([discord_channel_id])
GO
