#!/usr/bin/env node
const discordMessage = require('./Libraries/DatabaseLibrary/DiscordMessage.js');
const fs = require('fs');
const Discord = require('discord.js');
const auth = require('./auth/auth.json');
const snowflakes = require('./auth/snowflakes.json');
const sqlAuth = require('./auth/azureauth.json');
const BotCommon = require('./Libraries/BotLibrary/botcommon.js');
const common = require('./Libraries/CommonLibrary/common.js');
const reactions = require('./Libraries/BotLibrary/reactions.js');

const bot = new BotCommon();
const sqlConfig = sqlAuth;
const botClient = new Discord.Client();
bot.botClient = botClient;

// Automation
const automation = require('./Libraries/BotLibrary/automation.js');
//const automate = new automation(snowflakes.automatesheetid);

// Command and Event handlers.
let commands = {};
fs.readdir("./commands", (err, files) => {
	for (const file of files) {
		if (file.includes(".js")) {
			commands[file.replace(".js", "")] = require(`./commands/${file}`);
		}
	}
});
botClient.on('ready', () => {
	if (auth.dev === 0) {
		botClient.user.setActivity('Komennot: !help');
	} else {
		botClient.user.setActivity('Its Time For Kablew!');
	}
});
botClient.on('error', () => bot.log('discord errored'));
botClient.login(auth.token);
botClient.on('raw', packet => {
    if (auth.dev === 0) {
        if (['MESSAGE_REACTION_ADD'].includes(packet.t)) {
            reactions.handleReactions(packet);
        }
        if (['GUILD_MEMBER_ADD'].includes(packet.t)) {
            bot.logEvent('Uusi käyttäjä (' + packet.d.user.id + ') ' + packet.d.user.username + ' liittyi serverille.');
        }
        if (['GUILD_MEMBER_REMOVE'].includes(packet.t)) {
            bot.logEvent('Käyttäjä (' + packet.d.user.id + ') ' + packet.d.user.username + ' poistui serveriltä.');
        }
    } else {
        if (['MESSAGE_REACTION_ADD'].includes(packet.t)) {
            //reactions.handleReactions(packet);
        }
    }
});
botClient.on('message', msg => {
	// Bottikomennot
	for (const cmd in commands) {
		const command = commands[cmd];
		const properties = command.properties;
		const args = msg.content.split(" ");

		if (args[0].replace(auth.prefix, "") == properties.command) {
			if (properties.arguments.length == 0) {
				command.run(msg);
			} else {
				command.run(msg, args);
			}
		}
	}
	// Reaaliaikainen syncronointi
	if (!(msg.channel instanceof Discord.DMChannel) && auth.dev === 0) {
		if (msg.channel.id !== '532946068967784508' && msg.channel.id !== '524337438462836779' && msg.channel.id !== '502911862606659586') {
			discordMessage.save(msg);
			bot.messagesSynced++;
		}
	}
});

/**
 * Globaali virheenkäsittelijä
 */
process.on('uncaughtException', (e) => {
    console.info('uncaughtException even-listener has invoked');
    console.error(e);
});

exports.discord = Discord;
exports.client = botClient;
exports.bot = bot;
exports.snowflakes = snowflakes;
exports.common = common;
exports.sqlConfig = sqlConfig;
