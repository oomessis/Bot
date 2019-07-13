/*jslint node: true */
"use strict";
let app = require("./../bot.js");

const properties = {
	command: "syncbadges",
	description: "Synkronisoidaan badgeviestien sisällöt",
	visible: true,
	arguments: []
};

function run(message, args) {
    if (typeof args[1] !== 'undefined') {
        let guild = app.client.guilds.get(app.snowflakes.messis);
        let member = guild.members.get(message.author.id);
        if (message.author.id === app.snowflakes.admin || member.roles.has(app.snowflakes.tuotantotiimi) || member.roles.has(app.snowflakes.yllapito)) {
            
        }
    }
}
exports.properties = properties;
exports.run = run;

