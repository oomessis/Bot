/*********************************************************************
PURPOSE:        Establish table for Discord messages
HISTORY:        27.10.2018 - Raybarg
NOTES:          -
*********************************************************************/
drop table discord_messages
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[discord_messages]') AND objectproperty(id, N'isusertable') =1)
BEGIN
	SET NOCOUNT ON
END
ELSE
BEGIN
	CREATE table [dbo].[discord_messages] (			
		[discord_message_id] [int] IDENTITY(1,1) NOT NULL	-- Own identity
			CONSTRAINT pk_planning_work PRIMARY KEY ,
		[server_id] nvarchar(50) NOT NULL,					-- server ID
		[channel_id] nvarchar(50) NOT NULL,					-- channel ID
		[message_id] nvarchar(50) NOT NULL,					-- message ID
		[message_date] datetime NOT NULL,					-- Message date
		[person_name] nvarchar(50) NOT NULL,				-- Message author name
		[message_json] nvarchar(max) NOT NULL
	) ON [primary]
END
GO
