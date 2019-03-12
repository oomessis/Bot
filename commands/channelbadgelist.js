const Discord = require('discord.js');

exports.run = (client, message, args, level) => {
    let channelName = message.content.substring(18);
    channelBadgeList(message, channelName);

    /**
     * Listaa annetulla kanavalla saadut badget
     * @param {*} msg
     * @param {*} channelName
     */
    function channelBadgeList(msg, channelName) {
        client.bot.getChannelBadges(channelName, function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows) {
                    let badgeList = 'Badgelistaus kanavahaulla: `' + channelName + '`:\n\n';
                    rows.forEach(cols => {
                        badgeList = '`' + cols[0].value.toString() + '`: ' + cols[2].value + '\n' + '' + cols[1].value + '\n\n';
                        msg.channel.send(badgeList.substring(0, 1999));
                    });
                    if (!(msg.channel instanceof Discord.DMChannel)) {
                        msg.delete(2000);
                    }
                }
            }
        });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['cbl'],
    permLevel: "Moderaattori"
};

exports.help = {
    name: "channelbadgelist",
    category: "Statiikka",
    description: "Kanavan badgelistaus",
    usage: "channelbadgelist <kanava>"
};