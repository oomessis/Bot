#!/usr/bin/env node
const discordMessage = require('./Libraries/DatabaseLibrary/DiscordMessage.js');
//const util = require('util');
const fs = require('fs');
//const Flatted = require('flatted');
const Discord = require('discord.js');
const auth = require('./auth/auth.json');
const snowflakes = require('./auth/snowflakes.json');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const sqlAuth = require('./auth/azureauth.json');
//const sqlAuthLocalDB = require('./auth/sqlauth.json');
const BotCommon = require('./Libraries/BotLibrary/botcommon.js');
//const http = require('http');
//const request = require('request');
const common = require('./Libraries/CommonLibrary/common.js');
const paikkakunnat = require('./Libraries/BotLibrary/paikkakunnat.js');
const reactions = require('./Libraries/BotLibrary/reactions.js');

const bot = new BotCommon();
const sqlConfig = sqlAuth;
const botClient = new Discord.Client();
bot.botClient = botClient;

// Command and Event handlers.
var commands = {};

fs.readdir("./commands", (err, files) => {
	for (const file of files) {
		if (file.includes(".js")) {
			commands[file.replace(".js", "")] = require(`./commands/${file}`);
		}
	}
});

botClient.on('ready', () => {
	if (auth.dev === 0) {
		// Automaattinen viestien synkronointi
		botClient.user.setActivity('Komennot: !help');
	} else {
		botClient.user.setActivity('Its Time For Kablew!');
	}
});
process.on('uncaughtException', (e) => {
    console.info('uncaughtException even-listener has invoked');
    console.error(e);
});
botClient.on('error', () => bot.log('discord errored'));
botClient.login(auth.token);

// Raaka paketin käsittely, reagoi jos viestiin lisätty reaktio ja reaktion lisääjällä on oikeudet kunnossa
// Suoritetaan vain joso botti ei ole development versio
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
            reactions.handleReactions(packet);
        }
        // Dev botti
        if (['PRESENCE_UPDATE'].includes(packet.t)) {
            if (packet.d.guild_id === snowflakes.messis) {
                //console.log(packet);
            }
        }
    }
});

botClient.on('message', msg => {
	let userName = '';
	let bPrivate = false;
	let argv = msg.content.split(' ');
	let cmd = common.getCommand(argv[0]);

	if (msg.channel instanceof Discord.DMChannel) {
		bPrivate = true;
	} else {
		bPrivate = false;
	}

	if (cmd.length > 0) {
		if (cmd === 'm' && msg.author.username === 'raybarg') {
			bot.bulkInterval = setInterval(function () {
				fetchBulkHistory(msg);
			}, 20000);

		} else if (cmd === "s" && msg.author.username === 'raybarg') {
			bot.syncInterval = setInterval(function () {
				syncHistory();
			}, 10000);

		} else if (cmd === "masssync" && msg.author.username === 'raybarg') {
			massSync();

		} else if (cmd === "channels" && msg.author.username === 'raybarg') {
			testGetChannels();

		} else if (cmd === "badgescores") {
			badgeScoreList(msg);

		} else if (cmd === "badgelist") {
			userName = msg.content.substring(11);
			badgeList(msg, userName);

		} else if (cmd === "channelbadgelist") {
			let channelName = msg.content.substring(18);
			channelBadgeList(msg, channelName);

		} else if (cmd === "avaa") {
			paikkakunnat.managePaikkakunta(botClient, msg.content.substring(6), msg.author, msg.channel, bPrivate);

		} else if (cmd === "imba") {
			paikkakunnat.paikkaKuntaStat(msg.channel, msg.content.substring(6));

		} else {
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
		
		}
	}

	if (!bPrivate && auth.dev === 0) {
		// Reaaliaikainen syncronointi
		if (msg.channel.id !== '532946068967784508' && msg.channel.id !== '524337438462836779' && msg.channel.id !== '502911862606659586') {
			discordMessage.saveMessage(msg);
			bot.messagesSynced++;
		}
	} else {
		if (!bPrivate) {

		}
	}
});

/**
 * Hakee viestihistorian kanavalta
 */
function fetchBulkHistory() {
	let targetChannel = botClient.channels.get(snowflakes.yleinen);
	targetChannel.fetchMessages({limit: bot.maxFetch, before: bot.lastID}).then(messages => {
		bot.log(messages.size.toString());
		let msgArr = messages.array();
		for (let i = 0; i < msgArr.length; i++) {
			discordMessage.saveMessage(msgArr[i]);
		}
		if (messages.size < bot.maxFetch) {
			clearInterval(bot.bulkInterval);
		} else {
			bot.lastID = msgArr[msgArr.length - 1].id;
		}

	}).catch(console.error);
}

/**
 * Intervaalikutsu uusien viestien synccaukseen
 */
function syncHistory() {
	bot.getLastID(function (err, lastMsgID) {
		if (err) {
			console.log(err);
		} else {
			syncNewMessages(lastMsgID);
		}
	});
}

/**
 * Hakee lastMsgID tokenin jälkeen tulleet uudet viestit
 * @param {*} lastMsgID Tokeni jonka jälkeen tulleita viestejä haetaan
 */
function syncNewMessages(lastMsgID) {
	let targetChannel = botClient.channels.get(snowflakes.yleinen);
	targetChannel.fetchMessages({limit: bot.maxFetch, after: lastMsgID}).then(messages => {
		if (messages.size > 0) {
			bot.log(messages.size.toString() + " / " + bot.maxFetch.toString());
		}
		if (messages.size > 0) {
			bot.messagesSynced += messages.size;
			let d = new Date();
			let thisHour = d.getHours();
			if (thisHour !== bot.lastHour) {
				if (bot.messagesSynced > 0) {
					bot.logEvent("Syncronoitu viestejä: " + bot.messagesSynced.toString());
				}

				bot.lastHour = thisHour;
				bot.messagesSynced = 0;
			}
		}
		let msgArr = messages.array();
		for (let i = 0; i < msgArr.length; i++) {
			discordMessage.saveMessage(msgArr[i]);
		}
	}).catch(console.error);
}

/**
 * Kanavien historioiden haku
 */
function massSync() {
	console.log(botClient.user.id);
	bot.getChannels(function (err, channels) {
		if (err) {
			console.log(err);
		} else {
			if (channels) {
				channels.forEach(cols => {
					bot.channels.push(cols[2].value);
				});
				console.log('Kanavia ' + bot.channels.length);
				bot.bulkIndex = 0;
				bot.bulkInterval = setInterval(function () {
					fetchBulkHistoryAllChannels();
				}, 20000);
			}
		}
	});
}

/**
 * Hakee viestihistorian kanavilta
 */
function fetchBulkHistoryAllChannels() {
	let targetChannel = botClient.channels.get(bot.channels[bot.bulkIndex]);
	if (targetChannel) {
		let can_read_history = targetChannel.permissionsFor(botClient.user.id).has("READ_MESSAGE_HISTORY", false);
		let can_view_channel = targetChannel.permissionsFor(botClient.user.id).has("VIEW_CHANNEL", false);
		if (can_read_history && can_view_channel) {
			targetChannel.fetchMessages({limit: bot.maxFetch, before: bot.lastID}).then(messages => {
				bot.log(bot.channels[bot.bulkIndex] + ' -> ' + messages.size.toString());
				let msgArr = messages.array();
				let iLoop = 1;
				messages.forEach(msg => {
					setTimeout(function() { discordMessage.saveMessage(msg); }, 100 * (iLoop+1));
					iLoop++;
				});
				if (messages.size < bot.maxFetch) {
					bot.bulkIndex++;
					bot.lastID = '';
				} else {
					bot.lastID = msgArr[msgArr.length - 1].id;
				}

			}).catch(console.error);
		} else {
			bot.log(bot.channels[bot.bulkIndex] + ' skipattu koska ei oikeuksia.');
			bot.bulkIndex++;
		}
	} else {
		bot.log(bot.channels[bot.bulkIndex] + ' skipattu koska kanavan haku ei palauttanut mitään.');
		bot.bulkIndex++;
	}
	if (bot.bulkIndex >= bot.channels.length) {
		clearInterval(bot.bulkInterval);
	}
}

/**
 * Haetaan badgejen ansaintalista
 * @param {*} msg
 * @param {*} strSearch
 */
function badgeScoreList(msg) {
	bot.getPABadgeScoreList(function (err, rows) {
		if (err) {
			console.log(err);
		} else {
			if (rows) {
				let listedPaging = 0;
				let scoreList = '```Montako kertaa puheenaihebadgeja ansaittu:\n';
				rows.forEach(cols => {
					if (cols[0].value > 0) {
						listedPaging++;
						scoreList += cols[0].value.toString() + ' \t\t' + cols[1].value + '\n';
						if (listedPaging >= 20) {
							scoreList += '```';
							msg.channel.send(scoreList);
							listedPaging = 0;
							scoreList = '```';
						}
					}
				});
				scoreList += '```';
				msg.channel.send(scoreList);
				if (!(msg.channel instanceof Discord.DMChannel)) {
					// Komennon poisto ei toimi privachatissa
					msg.delete(2000);
				}
			}
		}
	});
}

/**
 * Haetaan badgejen ansaintalista
 * @param {*} msg
 * @param {*} userName
 */
function badgeList(msg, userName) {
	bot.getPAUserBadges(userName, function (err, rows) {
		if (err) {
			console.log(err);
		} else {
			if (rows) {
				let listedPaging = 0;
				let scoreList = 'Badgelistaus käyttäjänimihaulla: `' + userName + '`:\n\n';
				rows.forEach(cols => {
					if (cols[0].value > 0) {
						listedPaging++;
						scoreList += '`' + cols[0].value.toString() + '`: ' + cols[2].value + '\n' + '' + cols[1].value + '\n\n';
						if (listedPaging >= 20) {
							scoreList += '';
							msg.channel.send(scoreList);
							listedPaging = 0;
							scoreList = '';
						}
					}
				});
				msg.channel.send(scoreList);
				if (!(msg.channel instanceof Discord.DMChannel)) {
					msg.delete(2000);
				}
			}
		}
	});
}

/**
 * Listaa annetulla kanavalla saadut badget
 * @param {*} msg
 * @param {*} channelName
 */
function channelBadgeList(msg, channelName) {
	bot.getChannelBadges(channelName, function (err, rows) {
		if (err) {
			console.log(err);
		} else {
			if (rows) {
				let badgeList = 'Badgelistaus kanavahaulla: `' + channelName + '`:\n\n';
				rows.forEach(cols => {
					badgeList = '`' + cols[0].value.toString() + '`: ' + cols[2].value + '\n' + '' + cols[1].value + '\n\n';
					msg.channel.send(badgeList.substring(0, 1999));
				});
				if (!(msg.channel instanceof Discord.DMChannel)) {
					msg.delete(2000);
				}
			}
		}
	});
}

/**
 * Testimetodi, haetaan botin tuntemat kanavat ja listataan ne konsoliin
 */
function testGetChannels() {
	botClient.guilds.forEach((guild) => {
		if (guild.id === snowflakes.messis) {
			let spam = '';
			let count = 0;
			console.log(" - " + guild.name);

			// kanavat
			guild.channels.forEach(function(channel) {
				if (channel.type !== 'category' && channel.type !== 'voice') {
					spam += ` -- ${channel.name} (${channel.type}) - ${channel.id}\n`;
					setTimeout(function() { saveChannel(guild.id, channel); }, 200 * count);
					count++;
				}
			});
			bot.logEvent(count.toString() + ' kanavaa päivitetty tietokantaan.');
			console.log(spam);
		} else {
			console.log(guild);
		}
	});
}

/**
 * Tallentaa yhden kanavan tiedon tietokantaan
 * @param {*} guild Guild ID
 * @param {*} channel Kanavan olio
 */
function saveChannel(guild, channel) {
	let con = new Connection(sqlConfig);
	con.on('error', function(err) {
		console.log('Connection error: \n' + err);
	});
	con.on('connect', function (err) {
		if (err) {
			console.log(err);
		} else {
			let request = new Request('up_upd_discord_channels', function (err) {
				if (err) {
					console.log(err);
				}
				con.close();
			});
			request.addParameter('iDiscord_channel_id', TYPES.Int, 0);
			request.addParameter('iServer_id', TYPES.NVarChar, guild.toString());
			request.addParameter('iChannel_id', TYPES.NVarChar, channel.id.toString());
			request.addParameter('strChannel_name', TYPES.NVarChar, channel.name.toString());
			request.addParameter('bChannel_tracked', TYPES.NVarChar, 0);
			con.callProcedure(request);
		}
	});
}

exports.discord = Discord;
exports.client = botClient;
exports.bot = bot;
exports.snowflakes = snowflakes;
exports.common = common;
exports.sqlConfig = sqlConfig;