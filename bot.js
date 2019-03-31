const discordMessage = require('./Libraries/DatabaseLibrary/DiscordMessage.js');
const util = require('util');
const fs = require('fs');
const Flatted = require('flatted');
const Discord = require('discord.js');
const logger = require('winston');
const auth = require('./auth/auth.json');
const snowflakes = require('./auth/snowflakes.json');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const sqlAuth = require('./auth/azureauth.json');
const sqlAuthLocalDB = require('./auth/sqlauth.json');
const BotCommon = require('./Libraries/BotLibrary/botcommon.js');
const http = require('http');
const request = require('request');
const common = require('./Libraries/CommonLibrary/common.js');

const bot = new BotCommon();

const sqlConfig = sqlAuth;

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console(), {
	colorize: true
});
logger.level = 'debug';

const messisBot = new Discord.Client();
messisBot.on('ready', () => {
	if (auth.dev === 0) {
		// Automaattinen viestien synkronointi
		bot.syncInterval = setInterval(function () { syncHistory();	}, 10000);
		messisBot.user.setActivity('Komennot: !help');
	} else {
		messisBot.user.setActivity('Its Time For Kablew!');
	}
});

messisBot.on('error', () => bot.log('errored'));
messisBot.login(auth.token);

// Raaka paketin käsittely, reagoi jos viestiin lisätty reaktio ja reaktion lisääjällä on oikeudet kunnossa
// Suoritetaan vain joso botti ei ole development versio
messisBot.on('raw', packet => {
    if (auth.dev === 0) {
        if (['MESSAGE_REACTION_ADD'].includes(packet.t)) {
            handleReactions(packet);
        }
        if (['GUILD_MEMBER_ADD'].includes(packet.t)) {
            logEvent('Uusi käyttäjä (' + packet.d.user.id + ') ' + packet.d.user.username + ' liittyi serverille.');
        }
        if (['GUILD_MEMBER_REMOVE'].includes(packet.t)) {
            logEvent('Käyttäjä (' + packet.d.user.id + ') ' + packet.d.user.username + ' poistui serveriltä.');
        }
    } else {
        if (['MESSAGE_REACTION_ADD'].includes(packet.t)) {
            if (packet.d.emoji.name !== 'juttu') handleReactions(packet);
        }
        // Dev botti
        if (['PRESENCE_UPDATE'].includes(packet.t)) {
            if (packet.d.guild_id === snowflakes.messis) {
                //console.log(packet);
            }
        }
    }
});

messisBot.on('message', msg => {
	let userName = '';
	let bPrivate = false;
	let argv = msg.content.split(' ');
	let cmd = getCommand(argv[0]);

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

		} else if (cmd === 'ajarooli' && msg.author.username === 'raybarg') {
			giveLotsofPermissions();

		} else if (cmd === 'avatar') {
			userName = msg.content.substring(8);
			userTest(msg, userName);

		} else if (cmd === 'stat') {
			userStat(msg);

		} else if (cmd === 'help') {
			helpSpam(msg);

		} else if (cmd === "sana") {
			let strSearch = msg.content.substring(6);
			if (!this.countingWords) {
				wordCount(msg, strSearch);
			}

		} else {

		}
	}

	if (!bPrivate && auth.dev === 0) {
		// Reaaliaikainen syncronointi
		if (msg.channel.id !== '532946068967784508' && msg.channel.id !== '524337438462836779' && msg.channel.id !== '502911862606659586') {
			// hoidetaan yleinen vielä intervalilla
			if (msg.channel.id !== '446419809668694019') {
				saveMessage(msg);
				bot.messagesSynced++;
			}
		}
	} else {
		if (!bPrivate) {

		}
	}
});

/**
 * Hakee viestihistorian kanavalta
 * @param {*} msg Discordin viestiolio, tämän oli tarkoitus toimia kanavan tokenin antajana, mutta nyt hakuun on tehty kanavan tokenin magic number
 */
function fetchBulkHistory(msg) {
	let targetChannel = messisBot.channels.get(snowflakes.yleinen);
	targetChannel.fetchMessages({limit: bot.maxFetch, before: bot.lastID}).then(messages => {
		bot.log(messages.size.toString());
		let msgArr = messages.array();
		for (let i = 0; i < msgArr.length; i++) {
			saveMessage(msgArr[i]);
		}
		if (messages.size < bot.maxFetch) {
			clearInterval(bot.bulkInterval);
		} else {
			bot.lastID = msgArr[msgArr.length - 1].id;
		}

	}).catch(console.error);
}

/**
 * Haetaan lista montako kertaa sana toistuu eri kanavilla
 * @param {*} msg
 * @param {*} strSearch
 */
function wordCount(msg, strSearch) {
	bot.wordCount(strSearch, function (err, rows) {
		let embed = new Discord.RichEmbed();
		let chanList = '';

		if (err) {
			console.log(err);
		} else {
			if (rows) {
				let total = 0;
				let listed = 0;
				embed.setTitle(getDisplayName(msg) + ' kysyi montako kertaa sana \"**' + strSearch + '**\" esiintyy kanavilla top 10:');
				embed.setAuthor(messisBot.user.username, messisBot.user.displayAvatarURL);
				rows.sort(compare);
				rows.forEach(cols => {
					if (cols[0].value > 0) {
						listed++;
						if (listed <= 10) {
							chanList += listed.toString() + '. #' + cols[1].value + ' - **' + cols[0].value.toString() + '**\n';
						}
						total += cols[0].value;
					}
				});
				chanList += '---\n';
				chanList += 'Yhteensä kaikilta kanavilta: **' + total.toString() + '**\n';
				embed.setDescription(chanList);
				msg.channel.send(embed).then(sentMsg => {
					//sentMsg.delete(30000);
				});
				if (!(msg.channel instanceof Discord.DMChannel)) {
					// Komennon poisto ei toimi privachatissa
					msg.delete(2000);
				}
			} else {

			}
		}
	}).catch(console.error);
}

/**
 * Listan sorttaus
 * @param {*} a
 * @param {*} b
 */
function compare(a, b) {
	let ay = a[0].value;
	let by = b[0].value;
	if (ay < by) {
		return 1;
	}
	if (ay > by) {
		return -1;
	}
	return 0;
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
	}).catch(console.error);
}

/**
 * Hakee lastMsgID tokenin jälkeen tulleet uudet viestit
 * @param {*} lastMsgID Tokeni jonka jälkeen tulleita viestejä haetaan
 */
function syncNewMessages(lastMsgID) {
	let targetChannel = messisBot.channels.get(snowflakes.yleinen);
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
					logEvent("Syncronoitu viestejä: " + bot.messagesSynced.toString());
				}

				bot.lastHour = thisHour;
				bot.messagesSynced = 0;
			}
		}
		let msgArr = messages.array();
		for (let i = 0; i < msgArr.length; i++) {
			saveMessage(msgArr[i]);
		}
	}).catch(console.error);
}

/**
 * Tallentaa yhden viestin tietokantaan
 * @param {*} message Viestin olio
 */
function saveMessage(message) {
	let con = new Connection(sqlConfig);

	// Ei tallenneta messis botin omia viestejä
	if (message.author.id === snowflakes.messisbot) {
		return;
	}

	// Ei tallenneta bottien omia viestejä.
	if (message.author.bot === Boolean(true)) {
		return;
	}

	if (!message.channel.id) {
		console.log("Channel id is null!");
		return;
	}

	con.on('connect', function (err) {
		if (err) {
			console.log(err);
		} else {
			let request = new Request('up_upd_discord_messages', function (err) {
				if (err) {
					console.log(err);
				}
				con.close();
			});
			let d = message.createdAt;
			// Tehdään itse sopiva datestring muotoa YYYY-MM-DD hh:mm jota mssql syö natiivisti
			let dateString = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
			request.addParameter('iServer_id', TYPES.NVarChar, message.guild.id.toString());
			request.addParameter('iChannel_id', TYPES.NVarChar, message.channel.id.toString());
			request.addParameter('iDiscord_message_id', TYPES.Int, 0);
			request.addParameter('iMessage_id', TYPES.NVarChar, message.id.toString());
			request.addParameter('dtMessage_date', TYPES.DateTime2, dateString);
			request.addParameter('strPerson_name', TYPES.NVarChar, message.author.username);
			request.addParameter('strMessage_text', TYPES.NVarChar, message.content.substring(0, 1999));
			request.addParameter('iUser_id', TYPES.NVarChar, message.author.id.toString());
			con.callProcedure(request);
		}
	});
}

/**
 * Testimetodi, haetaan botin tuntemat kanavat ja listataan ne konsoliin
 */
function testGetChannels() {
	messisBot.guilds.forEach((guild) => {
		if (guild.id === snowflakes.messis) {
			let spam = '';
			let count = 0;
			console.log(" - " + guild.name);

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
		} else {
			console.log(guild);
		}
	});
}

/**
 * Annetaan kaikille guildin jäsenille yleisrooli
 */
function giveLotsofPermissions() {
	let target = messisBot.guilds.get(snowflakes.messis);
	console.log(target);
	target.members.filter(m => !m.user.bot && !m.roles.has(snowflakes.yleisrooli)).map(async member => await member.addRole(snowflakes.yleisrooli).catch(console.error));
}

/**
 * Näyttää privaviestinä jäsenen avatar-urlin komennon antajalle
 * @param {*} msg
 * @param {*} u
 */
function userTest(msg, u) {
	logEvent("Avatar käyttäjästä " + u + " : " + msg.author.username);
	let guild = messisBot.guilds.get(snowflakes.messis);
	guild.members.filter(m => m.user.username === u).map(member => {
		msg.author.send(u + ' käyttäjän avatar url: ' + member.user.avatarURL);
	});
}

/**
 * Statistiikkaa, kertoo montako viestiä on kanavalla ja montako kutsun antaneella jäsenellä
 * @param {*} msg
 */
function userStat(msg) {
	logEvent("Statistiikkaa käyttäjälle: " + getDisplayName(msg));
	bot.getLastID(function (err, lastMsgID) {
		syncNewMessages(lastMsgID);
		bot.messageCount(function (err, totalAllChannels) {
			if (err) {
				console.log(err);
			} else {
				bot.userMessageCount(msg.author.id, function (err, totalUserList) {
					if (err) {
						console.log(err);
					} else {
						if (totalUserList) {
							let embed = new Discord.RichEmbed();
							let total = 0;
							let listed = 0;
							let chanList = '';
							let percent = 0;
							embed.setTitle('Käyttäjän `' + getDisplayName(msg) + '` viestien statistiikkaa top 10:');
							embed.setAuthor(messisBot.user.username, messisBot.user.displayAvatarURL);
							totalUserList.sort(compare);
							totalUserList.forEach(cols => {
								if (cols[0].value > 0) {
									listed++;
									if (listed <= 10) {
										chanList += listed.toString() + '. #' + cols[1].value + ' - **' + cols[0].value.toString() + '**\n';
									}
									total += cols[0].value;
								}
							});
							percent = (total / totalAllChannels) * 100;
							chanList += '---\n';
							chanList += 'Yhteensä kaikilta kanavilta: **' + total.toString() + '** / **' + totalAllChannels.toString() + '**. Olet kirjoittanut ' + parseFloat(percent).toFixed(1) + '% Messiksen viesteistä.';
							embed.setDescription(chanList);
							msg.channel.send(embed).then(sentMsg => {
								//sentMsg.delete(30000);
							});
							if (!(msg.channel instanceof Discord.DMChannel)) {
								// Komennon poisto ei toimi privachatissa
								msg.delete(2000);
							}
						}
					}
				}).catch(console.error);
			}
		}).catch(console.error);
	});
}

/**
 * Lähetetään privaviestinä helppilistaus botin ymmärtämistä komennoista
 * @param {*} msg
 */
function helpSpam(msg) {
	logEvent("Helppilistaus käyttäjälle: " + msg.author.username);
	let reply = {
		embed: {
			color: 3447003,
			title: "Messis Bot Komentolistaus",
			fields: [
				{
					name: "!stat",
					value: "Oma käyttäjästatistiikkasi joka lähetetään privaattiviestinä.",
					inline: false
				},
				{
					name: "!sana <esimerkki>",
					value: "Kanavakohtaine tilasto miten paljon sanaa 'esimerkki' on käytetty.",
					inline: false
				},
				{name: "!badgescores", value: "Lista ansaituista badgeistä per käyttäjä.", inline: false},
				{
					name: "!badgelist <nimi>",
					value: "<nimi> käyttäjän badget, pvm, linkki ja teksti.",
					inline: false
				},
				{
					name: "!avatar <käyttäjänimi>",
					value: "Hakee annetulle käyttäjänimelle avatar-linkin ja lähettää sen privaattiviestinä. Käyttäjänimi pitää olla discord-tilin oikea käyttäjänimi (ei näkyvä nimi) ja sen on oltava case-sensitiivinen.\nEsim. !avatar raybarg\nKomento ei kerro mitään jos käyttäjän nimellä ei löytynyt profiilia.",
					inline: false
				}
			]
		}
	};
	msg.author.send(reply);
	if (!(msg.channel instanceof Discord.DMChannel)) msg.delete(2000);
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
	messisBot.channels.filter(ch => ch.id === snowflakes.automaatio).map(async channel => await channel.send(msg));
}

/**
 * Tallentaa yhden kanavan tiedon tietokantaan
 * @param {*} guild Guild ID
 * @param {*} channel Kanavan olio
 */
function saveChannel(guild, channel) {
	let con = new Connection(sqlConfig);
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

/**
 * Tallentaa yhden papukaijan tietokantaan
 * @param {*} message Viestin olio
 */
function saveParrot(message, channelID) {
	let con = new Connection(sqlConfig);
	con.on('connect', function (err) {
		if (err) {
			console.log(err);
		} else {
			let request = new Request('up_upd_parrot', function (err) {
				if (err) {
					console.log(err);
				}
				con.close();
			});
			// Tehdään itse sopiva datestring muotoa YYYY-MM-DD hh:mm jota mssql syö natiivisti
			let d = message.createdAt;
			let dateString = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
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
	let announcement2 = 'Käyttäjän `' + message.author.username + '` kirjoittama viesti kanavalla `#' + message.channel.name + '` ansaitsi puheenaihe-badgen.\n<' + message.url + '>';

	logEvent(announcement2);

	let ch = messisBot.channels.find(ch => ch.name === channelName && ch.guild.id === snowflakes.toimitus);
	if (ch === null) {
		messisBot.channels.filter(ch => ch.id === snowflakes.toimituspapukaija).map(async channel => await channel.send(announcement2));
	} else {
		ch.send(announcement2);
	}
	let chYleinen = messisBot.channels.find(ch => ch.id = snowflakes.yleinen);
	if (chYleinen) {
		chYleinen.send(common.announcementFromMessage(message));
	}

	// Puheenaiheet kanavalle
	messisBot.channels.filter(chPh => chPh.id === snowflakes.puheenaiheet).map(async channelPh => await channelPh.send(common.announcementFromMessage(message)));
}

/**
 * Kanavien historioiden haku
 */
function massSync() {
	console.log(messisBot.user.id);
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
	if (bot.channels[bot.bulkIndex] !== snowflakes.yleinen) {
		let targetChannel = messisBot.channels.get(bot.channels[bot.bulkIndex]);
		if (targetChannel) {
			let can_read_history = targetChannel.permissionsFor(messisBot.user.id).has("READ_MESSAGE_HISTORY", false);
			let can_view_channel = targetChannel.permissionsFor(messisBot.user.id).has("VIEW_CHANNEL", false);
			if (can_read_history && can_view_channel) {
				targetChannel.fetchMessages({limit: bot.maxFetch, before: bot.lastID}).then(messages => {
					bot.log(bot.channels[bot.bulkIndex] + ' -> ' + messages.size.toString());
					let msgArr = messages.array();
					for (let i = 0; i < msgArr.length; i++) {
						saveMessage(msgArr[i]);
					}
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
}

/**
 * Tulkitaan msg-objektista userin nimi/nicki
 * @param {*} msg
 */
function getDisplayName(msg) {
	if (msg.channel instanceof Discord.DMChannel) {
		return msg.author.username;
	} else {
		return msg.member.displayName;
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
	}).catch(console.error);
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
	}).catch(console.error);
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
	}).catch(console.error);
}

/**
 * Reaktion lisäyksen käsittely
 * @param {*} packet 
 */
function handleReactions(packet) {
    let guild = messisBot.guilds.get(snowflakes.messis);
    let sourceGuild = packet.d.guild_id;
    let channel = messisBot.channels.get(packet.d.channel_id);
    let member = guild.members.get(packet.d.user_id);
    if (member.roles.has(snowflakes.tuotantotiimi) || member.roles.has(snowflakes.yllapito) || sourceGuild === '538291564934332416') {
        channel.fetchMessage(packet.d.message_id).then(message => {
            //const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
            //const reaction = message.reactions.get(emoji);
            if (packet.d.emoji.name === 'juttu') {
                bot.parroExists(message.author.id, message.id, function(err, parrotID) {
                    if (err) {
                        console.log(err);
                    } else {
                        if(parrotID === -1) {
                            saveParrot(message, channel.id);
                            toimitusPapukaija(channel.name, message);
                        }
                    }
                });
            } else if (packet.d.emoji.name === 'tietohallinto') {
				messisBot.channels.filter(
					ch => ch.id === snowflakes.channels.find(e => e.name === 'TietohallintoFeed').id
				).map(
					async channelPh => await channelPh.send(common.announcementFromMessage(message))
				);
			} else if (packet.d.emoji.name === 'toimitus') {
				messisBot.channels.filter(
					ch => ch.id === snowflakes.channels.find(e => e.name === 'ToimitusFeed').id
				).map(
					async channelPh => await channelPh.send(common.announcementFromMessage(message))
				);
			} else if (packet.d.emoji.name === 'ohjelma') {
				messisBot.channels.filter(
					ch => ch.id === snowflakes.channels.find(e => e.name === 'OhjelmaFeed').id
				).map(
					async channelPh => await channelPh.send(common.announcementFromMessage(message))
				);
            }
        }).catch(console.error);
    }
}
