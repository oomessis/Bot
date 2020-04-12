/*jslint node: true */
"use strict";

const app = require("../../bot.js");

const properties = {
	command: "puheenaiheet",
    aliases: [],
	description: "Listaa puheenaiheet.",
	visible: true,
	arguments: ["<käyttäjä>"]
};

function run(message, args) {
    if (typeof args[1] !== 'undefined') {
        // Henkilön badget
        let userName = args[1];
        app.bot.getPAUserBadges(userName, function (err, rows) {
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
                                message.channel.send(scoreList);
                                listedPaging = 0;
                                scoreList = '';
                            }
                        }
                    });
                    message.channel.send(scoreList);
                    if (!(message.channel instanceof app.discord.DMChannel)) {
                        message.delete(2000);
                    }
                }
            }
        });
    } else {
        // Kanavan badget
        let channelName = message.channel.name;
        app.bot.getChannelBadges(channelName, function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (rows) {
                    let badgeList = 'Badgelistaus kanavahaulla: `' + channelName + '`:\n\n';
                    rows.forEach(cols => {
                        badgeList = '`' + cols[0].value.toString() + '`: ' + cols[2].value + '\n' + '' + cols[1].value + '\n\n';
                        message.channel.send(badgeList.substring(0, 1999));
                    });
                    if (!(message.channel instanceof app.discord.DMChannel)) {
                        message.delete(2000);
                    }
                }
            }
        });
    }
}
exports.properties = properties;
exports.run = run;

/**
 * Haetaan badgejen ansaintalista
 * @param {*} msg
 * @param {*} userName
 */
function badgeList(msg, userName) {

}
