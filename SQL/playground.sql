SELECT TOP 10 * FROM discord_messages ORDER BY message_date DESC

select count(*) from discord_messages

select * from discord_messages order by message_date

select count(*), message_id from discord_messages group by message_id having count(*) > 0

SELECT * FROM discord_messages WHERE person_name = ''
SELECT COUNT(*) AS messageCount FROM discord_messages WHERE person_name = ''


SELECT COUNT(*) AS cnt FROM discord_messages WHERE person_name not like 'Messis Bot'

select count(*) maara, person_name from discord_messages 
group by person_name
order by count(*) desc

select datepart(month, message_date), count(*) as maara from discord_messages group by datepart(month, message_date) order by datepart(month, message_date)

select datepart(hour, message_date)-2 as hh, count(*) as maara from discord_messages group by datepart(hour, message_date)-2 order by datepart(hour, message_date)-2

select message_date from discord_messages

