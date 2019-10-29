/*jslint node: true */
"use strict";

const app = require("./../../bot.js");

const properties = {
	command: "rooli",
    aliases: [],
	description: "Listaa käyttäjät joilla on kyseinen rooli.",
	visible: true,
	arguments: ["<rooli>"]
};

/**
 * Annetaan kaikille guildin jäsenille yleisrooli
 * @param {*} message 
 */
function run(message, args) {
    if (typeof args[1] !== 'undefined') {
        let guild = app.client.guilds.get(app.snowflakes.messis);
        let member = guild.members.get(message.author.id);
        if (message.author.id === app.snowflakes.admin || member.roles.has(app.snowflakes.tuotantotiimi) || member.roles.has(app.snowflakes.yllapito)) {
            let guild = app.client.guilds.get(app.snowflakes.messis);
            let role = guild.roles.find(role => role.name === args[1]);
            let members = guild.members.filter(m => !m.user.bot && m.roles.has(role.id));
            let memblist = members.map(function(elem) {return elem;}).join(", ");
            if (!(message.channel instanceof app.discord.DMChannel)) {
                message.channel.send(`Rooli ${args[1]} on yhteensä ${members.size} jäsenellä:\n${memblist}`);
            } else {
                message.author.send(`Rooli ${args[1]} on yhteensä ${members.size} jäsenellä:\n${memblist}`);
            }
        }
    }
}
exports.properties = properties;
exports.run = run;
