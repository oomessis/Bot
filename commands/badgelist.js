const Discord = require('discord.js');

exports.run = (client, message, args, level) => {
    let userName = '';
    userName = message.author.username;
    badgeList(message, userName);

    /**
     * Haetaan badgejen ansaintalista
     * @param {*} msg
     * @param {*} userName
     */
    function badgeList(msg, userName) {
        client.bot.getPAUserBadges(userName, function(err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows) {
                    let listedPaging = 0;
                    let scoreList = 'Badgelistaus käyttäjänimihaulla: `' + userName + '`:\n\n';
                    rows.forEach(cols => {
                        if (cols[0].value > 0) {
                            listedPaging++;
                            scoreList += '`' + cols[0].value.toString() + '`: ' + cols[2].value + '\n' + '' + cols[1].value + '\n\n';
                            if (listedPaging >= 20) {
                                scoreList += '';
                                msg.channel.send(scoreList);
                                listedPaging = 0;
                                scoreList = '';
                            }
                        }
                    });
                    msg.channel.send(scoreList);
                    if(!(msg.channel instanceof Discord.DMChannel)) {
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
    aliases: [],
    permLevel: "Moderaattori"
};

exports.help = {
    name: "badgelist",
    category: "Statiikka",
    description: "<nimi> käyttäjän badget, pvm, linkki ja teksti.",
    usage: "badgelist <nimi>"
};