select count(*) maara, person_name from discord_messages 
group by person_name
order by count(*) desc

select * from discord_messages where person_name = '' order by message_date desc