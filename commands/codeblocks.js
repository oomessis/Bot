/*jslint node: true */
"use strict";

const app = require("./../bot.js");

const properties = {
	command: "codeblocks",
	description: "Displays code block usage.",
	visible: true,
	arguments: []
};

function run(message) {
	const embed = new app.discord.RichEmbed();
	embed.setTitle("Codeblock Tutorial");
	embed.setDescription("Please use code blocks when sending code.");
	embed.attachFiles(["./assets/codeblocks.png"]);
	embed.setImage("attachment://codeblocks.png");
    message.channel.send({embed});
}
exports.properties = properties;
exports.run = run;
