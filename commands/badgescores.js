const Discord = require('discord.js');
const Connection = require("tedious").Connection;
const Request = require('tedious').Request;
const request = require('request');

exports.run = (client, message, args, level) => {
    badgeScoreList(message);


    /**
     * Haetaan badgejen ansaintalista
     * @param {*} msg
     * @param {*} strSearch
     */
    function badgeScoreList(msg) {
        client.bot.getPABadgeScoreList(function(err, rows) {
            if (err) {
                client.logger.error(err);
            } else {
                if (rows) {
                    var listedPaging = 0;
                    var scoreList = '```Montako kertaa puheenaihebadgeja ansaittu:\n';
                    rows.forEach(cols => {
                        if (cols[0].value > 0) {
                            listedPaging++;
                            scoreList += cols[0].value.toString() + ' \t\t' + cols[1].value + '\n';
                            if (listedPaging >= 20) {
                                scoreList += '```';
                                msg.channel.send(scoreList);
                                listedPaging = 0;
                                scoreList = '```';
                            }
                        }
                    });
                    scoreList += '```';
                    msg.channel.send(scoreList);
                    if(!(msg.channel instanceof Discord.DMChannel)) {
                        // Komennon poisto ei toimi privachatissa
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
    name: "badgescores",
    category: "Badget",
    description: "Jonkin näköinen badge score lista.",
    usage: "badgescores"
};