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
const moment = require('moment');
const momentz = require('moment-timezone');

const bot = new BotCommon();
const sqlConfig = sqlAuth;
const botClient = new Discord.Client();
bot.botClient = botClient;

// Automation
//const automation = require('./Libraries/BotLibrary/automation.js');
//const automate = new automation(snowflakes.automatesheetid);

// Command and Event handlers.
botClient.commands = new Discord.Collection(); // Collection for all commands
botClient.aliases = new Discord.Collection(); // Collection for all aliases of every command

const modules = ['admin', 'automation', 'stats', 'misc']; // This will be the list of the names of all modules (folder) your bot has

modules.forEach(c => {
	fs.readdir(`./commands/${c}/`, (err, files) => {
		if (err) console.log(err);
		const jsfile = files.filter(f => f.split(".").pop() === "js");
		if(jsfile.length <= 0) {
			return console.log("[LOGS] Couldn't Find Commands!");
		}
		console.log(`[Commandlogs] Loaded ${files.length} commands of module ${c}`); // When commands of a module are successfully loaded, you can see it in the console
		files.forEach(f => { // Now we go through all files of a folder (module)
			const props = require(`./commands/${c}/${f}`); // Location of the current command file
			botClient.commands.set(props.properties.command, props); // Now we add the commmand in the client.commands Collection which we defined in previous code
			props.properties.aliases.forEach(alias => {  // It could be that the command has aliases, so we go through them too
				botClient.aliases.set(alias, props.properties.command); // If we find one, we add it to the client.aliases Collection
			});
		});
	});
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
            bot.logEvent('```diff\n+Uusi käyttäjä (' + packet.d.user.id + ') ' + packet.d.user.username + ' liittyi serverille.```');
        }
        if (['GUILD_MEMBER_REMOVE'].includes(packet.t)) {
            bot.logEvent('```diff\n-Käyttäjä (' + packet.d.user.id + ') ' + packet.d.user.username + ' poistui serveriltä.```');
		}
    } else {
        if (['MESSAGE_REACTION_ADD'].includes(packet.t)) {
			if (packet.d.emoji.name === 'idea') {
				//reactions.handleReactions(packet);
			}
		}
    }
});
botClient.on('message', msg => {
	const prefix = auth.prefix;
	const messageArray = msg.content.split(" ");
	const command = messageArray[0];
	const properties = command.properties;
	const args = messageArray.slice(1);

	const commandfile = botClient.commands.get(command.slice(prefix.length)) || botClient.commands.get(botClient.aliases.get(command.slice(prefix.length)));
	if(commandfile) commandfile.run(msg, args);

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
