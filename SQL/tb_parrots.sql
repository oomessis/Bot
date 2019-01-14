/*********************************************************************
PURPOSE:        Establish table for parrots
HISTORY:        14.1.2019 - Raybarg
NOTES:          -
*********************************************************************/
IF EXISTS (SELECT * FROM dbo.sysobjects WHERE id = object_id(N'[parrots]') AND objectproperty(id, N'isusertable') =1)
BEGIN
	SET NOCOUNT ON
END
ELSE
BEGIN
	CREATE table [dbo].[parrots] (			
		[parrot_id] [int] IDENTITY(1,1) NOT NULL			-- Own identity
			CONSTRAINT pk_parrot PRIMARY KEY ,
		[user_id] nvarchar(50) NOT NULL,					-- server ID
		[message_id] nvarchar(50) NOT NULL,					-- channel ID	
		[message_date] datetime NOT NULL,					-- Message date
		[person_name] nvarchar(50) NOT NULL,				-- Message author name
		[message_text] nvarchar(2000) NULL,					-- Message text
		[message_url] nvarchar(200) NULL					-- Message Url
	) ON [primary]
END
GO
