/*********************************************************************
PURPOSE:        Establish table for Discord messages
HISTORY:        27.10.2018 - Raybarg
NOTES:          -
*********************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[discord_messages]') AND objectproperty(id, N'isusertable') =1)
BEGIN
	IF ISNULL(columnproperty( object_id(N'[discord_messages]'),'message_text','precision'),0)=0
		alter table [discord_messages] add [message_text] NVARCHAR(2000) null

	IF ISNULL(columnproperty( object_id(N'[discord_messages]'),'user_id','precision'),0)=0
		alter table [discord_messages] add [user_id] NVARCHAR(50) null
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
		[message_text] nvarchar(2000) NULL,					-- Message text
		[user_id] nvarchar(50)								-- user ID
	) ON [primary]
END
GO
