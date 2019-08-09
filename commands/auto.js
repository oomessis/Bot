/*jslint node: true */
"use strict";
let app = require("./../bot.js");
let automation = require("./../Libraries/BotLibrary/automation.js");

const properties = {
	command: "auto",
	description: "Automatisoinnin komennot",
	visible: true,
	arguments: ["<komento>"]
};

function run(message, args) {
    if (typeof args[1] !== 'undefined') {
        let guild = app.client.guilds.get(app.snowflakes.messis);
        let member = guild.members.get(message.author.id);
        if (message.author.id === app.snowflakes.admin || member.roles.has(app.snowflakes.tuotantotiimi) || member.roles.has(app.snowflakes.yllapito)) {
            if (args[1] === 'list') {
                let automate = new automation(app);
                automate.read(message);
            }
        }
    }
}
exports.properties = properties;
exports.run = run;

