DECLARE @temp TABLE (
	dt DATETIME,
	usercount INT
)
INSERT INTO @temp SELECT message_date, 0 FROM discord_messages
DECLARE @dt DATETIME
DECLARE @ct INT
DECLARE @c CURSOR
SET @c = CURSOR FAST_FORWARD FOR
SELECT dt FROM @temp
OPEN @c
	FETCH NEXT FROM @c INTO @dt
	WHILE @@FETCH_STATUS = 0 BEGIN
		WITH cte AS (
			SELECT MIN(message_date) AS dt FROM discord_messages WHERE message_date < @dt GROUP BY person_name
		)
		SELECT @ct = COUNT(*) FROM cte
		UPDATE @temp SET usercount = @ct WHERE dt = @dt
		FETCH NEXT FROM @c INTO @dt
	END
CLOSE @c
DEALLOCATE @c
SELECT * FROM @temp
