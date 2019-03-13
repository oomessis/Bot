exports.run = async (client, message, args, level) => {
    const friendly = client.config.permLevels.find(l => l.level === level).name;
    message.reply(`Sinun oikeus tasosi on: ${level} - ${friendly}`);
};

exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: [],
    permLevel: "Käyttäjä"
};

exports.help = {
    name: "mylevel",
    category: "Sekalainen",
    description: "Kertoo käyttäjälle millä oikeus tasolla hän on",
    usage: "mylevel"
};