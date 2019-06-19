/*********************************************************************
PURPOSE:        Establish table for Messis users tags
HISTORY:        19.06.2019 - Raybarg
NOTES:          -
*********************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[messis_users_tags]') AND objectproperty(id, N'isusertable') =1)
BEGIN
	SET NOCOUNT ON
END
ELSE
BEGIN
	CREATE table [dbo].[messis_users_tags] (			
		[messis_users_tag_id] [int] IDENTITY(1,1) NOT NULL		-- Own identity
			CONSTRAINT pk_messis_users_tag_id PRIMARY KEY ,
		[messis_user_id] int NOT NULL,							-- user Messis ID
		[tag] nvarchar(50) NOT NULL								-- tag
	) ON [primary]
END
GO
	IF NOT EXISTS (SELECT *  FROM sys.indexes  WHERE name='index1' AND object_id = OBJECT_ID('[dbo].[messis_users_tags]'))
		CREATE NONCLUSTERED INDEX [index1] ON [dbo].[messis_users_tags] ([messis_user_id]) INCLUDE ([tag])
GO