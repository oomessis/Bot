/*********************************************************************
PURPOSE:        Establish table for Discord channels that are tracked for statistics
HISTORY:        11.1.2019 - Raybarg
NOTES:          -
*********************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[discord_channels]') AND objectproperty(id, N'isusertable') =1)
BEGIN
	SET NOCOUNT ON
END
ELSE
BEGIN
	CREATE table [dbo].[discord_channels] (			
		[discord_channel_id] [int] IDENTITY(1,1) NOT NULL	-- Own identity
			CONSTRAINT pk_discord_channels PRIMARY KEY ,
		[server_id] nvarchar(50) NOT NULL,					-- server ID
		[channel_id] nvarchar(50) NOT NULL,					-- channel ID
		[channel_name] nvarchar(50) NOT NULL,				-- channel name
		[channel_tracked] bit not null default 0			-- is channel tracked for statistics
	) ON [primary]
END
GO
