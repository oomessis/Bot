/*jslint node: true */
"use strict";

const discordMessage = require('./../Libraries/DatabaseLibrary/DiscordMessage.js');
const app = require("./../bot.js");

const properties = {
	command: "testmsg",
	description: "Testataan viestien hakua.",
	visible: true,
	arguments: []
};

/**
 * Kanavien historioiden haku
 * @param {*} message 
 */
function run(message) {
    if (message.author.id === app.snowflakes.admin) {
        let chan = app.client.channels.get(app.snowflakes.yleinen);
        chan.fetchMessages({limit: 5, before: '547723640637227028'}).then(messages => {
            console.log(messages);
        });
    }
}

exports.properties = properties;
exports.run = run;

