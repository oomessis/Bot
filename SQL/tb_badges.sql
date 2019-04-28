/*********************************************************************
PURPOSE:        Establish table for badges
HISTORY:        28.4.2019 - Raybarg
NOTES:          -
*********************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[messis_badges]') AND objectproperty(id, N'isusertable') =1)
BEGIN
	SET NOCOUNT ON
END
ELSE
BEGIN
	CREATE table [dbo].[messis_badges] (
		[badge_id] [int] IDENTITY(1,1) NOT NULL		-- Own identity
			CONSTRAINT pk_badges PRIMARY KEY ,
		[badge_type] INT,							-- Badge type
		[guild_id] NVARCHAR(50) NOT NULL,			-- guild ID	
		[channel_id] NVARCHAR(50) NOT NULL,			-- channel ID	
		[message_id] nvarchar(50) NOT NULL,			-- message ID	
		[user_id] nvarchar(50) NOT NULL,			-- server ID
		[person_name] nvarchar(50) NOT NULL,		-- Message author name
		[message_date] datetime NOT NULL,			-- Message date
		[message_url] nvarchar(200) NULL			-- Message Url
	) ON [primary]
END
GO
