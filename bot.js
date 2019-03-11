const discordMessage = require('./Libraries/DatabaseLibrary/DiscordMessage.js');
const util = require('util');
const fs = require('fs');
const Flatted = require('flatted');
const Discord = require('discord.js');
const auth = require('./auth/auth.json');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const sqlAuth = require('./auth/azureauth.json');
// const sqlAuthLocalDB = require('./auth/sqlauth.json');
const BotCommon = require('./Libraries/BotLibrary/botcommon.js');
const http = require('http');
const request = require('request');
const winston = require('winston');
const statsUtil = require('./commands/stats.js');

const bot = new BotCommon();

const sqlConfig = sqlAuth;

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: 'log' }),
	],
	format: winston.format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
});

const messisBot = new Discord.Client();
messisBot.on('ready', () => {
	if (auth.dev === 0) {
		// Automaattinen viestien synkronointi
		bot.syncInterval = setInterval(function() {
			statsUtil.syncHistory();
		}, 10000);
		messisBot.user.setActivity('Komennot: !help');
	}
	if (messisBot.user.id === '440790222347829258') {
		messisBot.user.setActivity('Skynet is dveloping with NodeJS');
	}
	else {
		messisBot.user.setActivity('Its Time For Kablew!');
	}
	logger.log('info', 'Online');
	//logger.log('warn', messisBot.channels.get(auth.yleinen));
});


messisBot.on('error', m => logger.log('error', m));
messisBot.login(auth.token);
messisBot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	messisBot.commands.set(command.name, command);
}


// Raaka paketin käsittely, reagoi jos viestiin lisätty reaktio ja reaktion lisääjällä on oikeudet kunnossa
// Suoritetaan vain joso botti ei ole development versio
messisBot.on('raw', packet => {
	if (auth.dev === 0) {
		if (['MESSAGE_REACTION_ADD'].includes(packet.t)) {
			const guild = messisBot.guilds.get(auth.messis);
			const channel = messisBot.channels.get(packet.d.channel_id);
			const member = guild.members.get(packet.d.user_id);
			if (member.roles.has(auth.tuotantotiimi) || member.roles.has(auth.yllapito)) {
				channel.fetchMessage(packet.d.message_id).then(message => {
					const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
					const reaction = message.reactions.get(emoji);
					if (packet.t === 'MESSAGE_REACTION_ADD' && packet.d.emoji.name === 'juttu') {
						bot.parroExists(message.author.id, message.id, function(err, parrotID) {
							if (err) {
								console.log(err);
							}
							else if (parrotID === -1) {
								saveParrot(message, channel.id);
								toimitusPapukaija(channel.name, message);
							}
						});
					}
				});
			}
		}
		if (['GUILD_MEMBER_ADD'].includes(packet.t)) {
			// uusi käyttäjä
			logEvent('Uusi käyttäjä (' + packet.d.user.id + ') ' + packet.d.user.username + ' liittyi serverille.');
		}
		if (['GUILD_MEMBER_REMOVE'].includes(packet.t)) {
			// uusi käyttäjä
			logEvent('Käyttäjä (' + packet.d.user.id + ') ' + packet.d.user.username + ' poistui serveriltä.');
		}
	}
	else {
		// Dev botti
		if (['PRESENCE_UPDATE'].includes(packet.t)) {
			if (packet.d.guild_id === auth.messis) {
				console.log(packet);
			}
		}
	}
});

messisBot.on('message', msg => {
	if (!msg.content.startsWith(auth.prefix) || msg.author.bot) return;
	let bPrivate = false;
	const argv = msg.content.split(' ');
	const args = msg.content.slice(auth.prefix.length).split(/ +/);
	const cmd = getCommand(argv[0]);

	bPrivate = msg.channel instanceof Discord.DMChannel;
	const command = args.shift().toLowerCase();

	if (!messisBot.commands.has(command)) return;

	console.log(command);

	try {
		messisBot.commands.get(command).execute(msg, args);
	} catch (error) {
		console.error(error);
		msg.reply('there was an error trying to execute that command!');
	}
});

/**
 * Testimetodi, haetaan botin tuntemat kanavat ja listataan ne konsoliin
 */
function testGetChannels() {
	messisBot.guilds.forEach((guild) => {
		if (guild.id === auth.messis) {
			let spam = '';
			let count = 0;
			console.log(' - ' + guild.name);

			// kanavat
			guild.channels.forEach((channel) => {
				if (channel.type !== 'category' && channel.type !== 'voice') {
					spam += ` -- ${channel.name} (${channel.type}) - ${channel.id}\n`;
					saveChannel(guild.id, channel);
					count++;
				}
			});
			logEvent(count.toString() + ' kanavaa päivitetty tietokantaan.');
			console.log(spam);
		}
		else {
			console.log(guild);
		}
	});
}

/**
 * Annetaan kaikille guildin jäsenille yleisrooli
 */
function giveLotsofPermissions() {
	const target = messisBot.guilds.get(auth.messis);
	console.log(target);
	target.members.filter(m => !m.user.bot && !m.roles.has(auth.yleisrooli)).map(async member => await member.addRole(auth.yleisrooli).catch(console.error));
}

/**
 * Lähetetään privaviestinä helppilistaus botin ymmärtämistä komennoista
 * @param {*} msg
 */
function helpSpam(msg) {
	logEvent('Helppilistaus käyttäjälle: ' + msg.author.username);
	const reply = { embed: {
		color: 3447003,
		title: 'Messis Bot Komentolistaus',
		fields: [
			{ name: '!stat', value: 'Oma käyttäjästatistiikkasi joka lähetetään privaattiviestinä.', inline: false },
			{ name: '!sana <esimerkki>', value: 'Kanavakohtaine tilasto miten paljon sanaa \'esimerkki\' on käytetty.', inline: false },
			{ name: '!badgescores', value: 'Lista ansaituista badgeistä per käyttäjä.', inline: false },
			{ name: '!badgelist <nimi>', value: '<nimi> käyttäjän badget, pvm, linkki ja teksti.', inline: false },
			{ name: '!avatar <käyttäjänimi>', value: 'Hakee annetulle käyttäjänimelle avatar-linkin ja lähettää sen privaattiviestinä. Käyttäjänimi pitää olla discord-tilin oikea käyttäjänimi (ei näkyvä nimi) ja sen on oltava case-sensitiivinen.\nEsim. !avatar raybarg\nKomento ei kerro mitään jos käyttäjän nimellä ei löytynyt profiilia.', inline: false },
		],
	} };
	msg.author.send(reply);
	if(!(msg.channel instanceof Discord.DMChannel)) msg.delete(2000);
}

/**
 * Prefiksin käsittely, parsitaan itse komento, palautetaan tyhjä jos prefix ei täsmää
 * @param {*} arg
 */
function getCommand(arg) {
	if (arg.substring(0, 1) === auth.prefix) {
		return arg.substring(1);
	}
	return '';
}

/**
 * Logitusviesti bottien omalle logituskanavalle
 * @param {*} msg
 */
function logEvent(msg) {
	messisBot.channels.filter(ch => ch.id === auth.automaatio).map(async channel => await channel.send(msg));
}

/**
 * Tallentaa yhden kanavan tiedon tietokantaan
 * @param {*} guild Guild ID
 * @param {*} channel Kanavan olio
 */
function saveChannel(guild, channel) {
	const con = new Connection(sqlConfig);
	con.on('connect', function(err) {
		if (err) {
			console.log(err);
		}
		else {
			const request = new Request('up_upd_discord_channels', function(err) {
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

/**
 * Tallentaa yhden papukaijan tietokantaan
 * @param {*} message Viestin olio
 */
function saveParrot(message, channelID) {
	const con = new Connection(sqlConfig);
	con.on('connect', function(err) {
		if (err) {
			console.log(err);
		}
		else {
			const request = new Request('up_upd_parrot', function(err) {
				if (err) {
					console.log(err);
				}
				con.close();
			});
			// Tehdään itse sopiva datestring muotoa YYYY-MM-DD hh:mm jota mssql syö natiivisti
			const d = message.createdAt;
			const dateString = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
			request.addParameter('iParrot_id', TYPES.Int, 0);
			request.addParameter('iUser_id', TYPES.NVarChar, message.author.id);
			request.addParameter('iMessage_id', TYPES.NVarChar, message.id.toString());
			request.addParameter('dtMessage_date', TYPES.DateTime2, dateString);
			request.addParameter('strPerson_name', TYPES.NVarChar, message.author.username);
			request.addParameter('strMessage_text', TYPES.NVarChar, message.content.substring(0, 1999));
			request.addParameter('strMessage_url', TYPES.NVarChar, message.url.substring(0, 199));
			request.addParameter('iChannel_id', TYPES.NVarChar, channelID.toString());
			con.callProcedure(request);
		}
	});
}

/**
 * Badgeviesti toimitukselle & yhteisölle
 * @param {*} channelName
 * @param {*} announcement
 * @param {*} message
 */
function toimitusPapukaija(channelName, message) {
	const announcement1 = 'Käyttäjän ' + message.author + ' kirjoittama viesti kanavalla `#' + message.channel.name + '` ansaitsi puheenaihe-badgen.\n<' + message.url + '>';
	const announcement2 = 'Käyttäjän `' + message.author.username + '` kirjoittama viesti kanavalla `#' + message.channel.name + '` ansaitsi puheenaihe-badgen.\n<' + message.url + '>';
	const content = message.content.split('`').join('');

	logEvent(announcement2);

	const ch = messisBot.channels.find(ch => ch.name === channelName && ch.guild.id === auth.toimitus);
	if (ch === null) {
		messisBot.channels.filter(ch => ch.id === auth.toimituspapukaija).map(async channel => await channel.send(announcement2));
	}
	else {
		ch.send(announcement2);
	}
	const chYleinen = messisBot.channels.find(ch => ch.id = auth.yleinen);
	if (chYleinen) {
		chYleinen.send(announcement1 + '\n```' + content + '```');
	}
	/*
    const chPuheenaiheet = messisBot.channels.find(ch => ch.id = auth.puheenaiheet);
    if (chPuheenaiheet) {
        chPuheenaiheet.send(announcement2 + '\n```' + content + '```');
    }
    */
}

/**
 * Kanavien historioiden haku
 */
function massSync() {
	console.log(messisBot.user.id);
	bot.getChannels(function(err, channels) {
		if (err) {
			console.log(err);
		}
		else if (channels) {
			channels.forEach(cols => {
				bot.channels.push(cols[2].value);
			});
			console.log('Kanavia ' + bot.channels.length);
			bot.bulkIndex = 0;
			bot.bulkInterval = setInterval(function() { fetchBulkHistoryAllChannels(); }, 20000);
		}
	});
}

/**
 * Hakee viestihistorian kanavilta
 */
function fetchBulkHistoryAllChannels() {
	if (bot.channels[bot.bulkIndex] !== auth.yleinen) {
		const targetChannel = messisBot.channels.get(bot.channels[bot.bulkIndex]);
		if (targetChannel) {
			const can_read_history = targetChannel.permissionsFor(messisBot.user.id).has('READ_MESSAGE_HISTORY', false);
			const can_view_channel = targetChannel.permissionsFor(messisBot.user.id).has('VIEW_CHANNEL', false);
			if (can_read_history && can_view_channel) {
				targetChannel.fetchMessages({ limit: bot.maxFetch, before: bot.lastID }).then(messages => {
					bot.log(bot.channels[bot.bulkIndex] + ' -> ' + messages.size.toString());
					const msgArr = messages.array();
					for(let i = 0; i < msgArr.length; i++) {
						saveMessage(msgArr[i]);
					}
					if(messages.size < bot.maxFetch) {
						bot.bulkIndex++;
						bot.lastID = '';
					}
					else {
						bot.lastID = msgArr[msgArr.length - 1].id;
					}

				}).catch(console.error);
			}
			else {
				bot.log(bot.channels[bot.bulkIndex] + ' skipattu koska ei oikeuksia.');
				bot.bulkIndex++;
			}
		}
		else {
			bot.log(bot.channels[bot.bulkIndex] + ' skipattu koska kanavan haku ei palauttanut mitään.');
			bot.bulkIndex++;
		}
		if (bot.bulkIndex >= bot.channels.length) {
			clearInterval(bot.bulkInterval);
		}
	}
}


/**
 * Haetaan badgejen ansaintalista
 * @param {*} msg
 * @param {*} strSearch
 */
function badgeScoreList(msg) {
	bot.getPABadgeScoreList(function(err, rows) {
		if (err) {
			console.log(err);
		}
		else if (rows) {
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
			if(!(msg.channel instanceof Discord.DMChannel)) {
				// Komennon poisto ei toimi privachatissa
				msg.delete(2000);
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
	bot.getPAUserBadges(userName, function(err, rows) {
		if (err) {
			console.log(err);
		}
		else if (rows) {
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
			if(!(msg.channel instanceof Discord.DMChannel)) {
				msg.delete(2000);
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
	bot.getChannelBadges(channelName, function(err, rows) {
		if (err) {
			console.log(err);
		}
		else if (rows) {
			let list = 'Badgelistaus kanavahaulla: `' + channelName + '`:\n\n';
			rows.forEach(cols => {
				list = '`' + cols[0].value.toString() + '`: ' + cols[2].value + '\n' + '' + cols[1].value + '\n\n';
				msg.channel.send(badgeList.substring(0, 1999));
			});
			if(!(msg.channel instanceof Discord.DMChannel)) {
				msg.delete(2000);
			}
		}
	});
}


module.exports = messisBot;