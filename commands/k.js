/*jslint node: true */
"use strict";

const app = require("./../bot.js");

const properties = {
	command: "k",
	description: "Korvaa tekstin osan viestissä.",
	visible: true,
	arguments: ["<arg>"]
};

function run(message, args) {
    if (app.common.isTuotantotiimiGuild(message.guild.id) || (message.guild.id === app.snowflakes.messis && message.channel.id === app.snowflakes.puheenaiheet)) {
        if (typeof args[1] !== 'undefined') {
            let msgID = args[1];
            message.channel.fetchMessage(msgID).then(editMessage => {
                if (editMessage.author.id === app.client.user.id) {
                    const msgCommands = message.content.split('\"');
                    const reg = new RegExp(msgCommands[1].trim(), 'gi');
                    editMessage.edit(editMessage.content.replace(reg, msgCommands[2])).then(message.delete());
                } else {
                    message.channel.send("En voi muokata kuin omia viestejäni.");
                }
            });
        }
    }
}

exports.properties = properties;
exports.run = run;

