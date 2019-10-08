/*jslint node: true */
"use strict";

const app = require("./../bot.js");

const properties = {
	command: "m",
	description: "Muokkaa viestiä.",
	visible: true,
	arguments: ["<arg>"]
};

function run(message, args) {
    if (app.common.isTuotantotiimiGuild(message.guild.id)) {
        if (typeof args[1] !== 'undefined') {
            let msgID = args[1];
            let txt = message.content.substring(message.content.indexOf("\"") + 1);
            message.channel.fetchMessage(msgID).then(editMessage => {
                if (editMessage.author.id === app.client.user.id) {
                    editMessage.edit(editMessage.content + ' \n' + txt).then(message.delete());
                } else {
                    message.channel.send("En voi muokata kuin omia viestejäni.");
                }
            });
        }
    }
}

exports.properties = properties;
exports.run = run;

