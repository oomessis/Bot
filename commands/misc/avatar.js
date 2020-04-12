/*jslint node: true */
"use strict";

const app = require("../../bot.js");

const properties = {
	command: "avatar",
    aliases: [],
	description: "Näyttää avatar urlin käyttäjästä.",
	visible: true,
	arguments: ["<käyttäjä>"]
};

function run(message, args) {
    if (typeof args[1] !== 'undefined') {
        let userName = args[1];
        app.bot.logEvent("Avatar käyttäjästä " + userName + " : " + message.author.username);
        let guild = app.client.guilds.get(app.snowflakes.messis);
        guild.members.filter(m => m.user.username === userName).map(member => {
            message.author.send(userName + ' käyttäjän avatar url: ' + member.user.avatarURL);
        });
    }
}
exports.properties = properties;
exports.run = run;