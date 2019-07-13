/*********************************************************************
PURPOSE:        Establish table for Messis users
HISTORY:        19.06.2019 - Raybarg
NOTES:          -
*********************************************************************/
--drop table messis_users
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[messis_users]') AND objectproperty(id, N'isusertable') =1)
BEGIN
	SET NOCOUNT ON
END
ELSE
BEGIN
	CREATE table [dbo].[messis_users] (			
		[messis_user_id] [int] IDENTITY(1,1) NOT NULL		-- Own identity
			CONSTRAINT pk_messis_user_id PRIMARY KEY ,
		[discord_user_id] nvarchar(50) COLLATE Finnish_Swedish_CI_AS NOT NULL ,		-- user Discord ID
		[discord_user_name] nvarchar(50) COLLATE Finnish_Swedish_CI_AS NOT NULL ,	-- user name
		[discord_joined_at] datetime						-- user joined at date from Discord
	) ON [primary]
END
GO
	IF NOT EXISTS (SELECT *  FROM sys.indexes  WHERE name='index1' AND object_id = OBJECT_ID('[dbo].[messis_users]'))
		CREATE NONCLUSTERED INDEX [index1] ON [dbo].[messis_users] ([discord_user_id]) INCLUDE ([discord_user_name])
GO

/*
drop index [index1] on dbo.messis_users
alter table dbo.messis_users alter column discord_user_name nvarchar(50) COLLATE Finnish_Swedish_CI_AS NOT NULL
*/