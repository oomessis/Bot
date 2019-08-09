/*********************************************************************
PURPOSE:        Establish table for badge enumeration
HISTORY:        28.4.2019 - Raybarg
NOTES:          -
*********************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[enum_badges]') AND objectproperty(id, N'isusertable') =1)
BEGIN
	SET NOCOUNT ON
END
ELSE
BEGIN
	CREATE table [dbo].[enum_badges] (
		[enum_badges_id] [int] IDENTITY(1,1) NOT NULL	
			CONSTRAINT pk_enum_badges PRIMARY KEY,
		[badge_type] INT NOT NULL,
		[badge_name] NVARCHAR(200)						-- Badge name
	) ON [primary]
END
GO
