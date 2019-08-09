/*********************************************************************
PURPOSE:        Establish table for achievements
HISTORY:        28.4.2019 - Raybarg
NOTES:          -
*********************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[messis_achievements]') AND objectproperty(id, N'isusertable') =1)
BEGIN
	SET NOCOUNT ON
END
ELSE
BEGIN
	CREATE table [dbo].[messis_achievements] (
		[achievement_id] [int] IDENTITY(1,1) NOT NULL	-- Own identity
			CONSTRAINT pk_achievements PRIMARY KEY ,
		[person_name] nvarchar(50) NOT NULL,			-- Member
		[achievement_description] nvarchar(200) NULL	-- Achievement
	) ON [primary]
END
GO
