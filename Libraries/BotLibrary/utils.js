const Discord = require('discord.js');
const messisBot = require('../../bot');
const auth = require('../../auth/auth.json');
const logEvent = require('../../Libraries/BotLibrary/utils.js');
const TYPES = require('tedious').TYPES;
const sqlAuth = require('../../auth/azureauth.json');
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const sqlConfig = sqlAuth;

const BotCommon = require('./botcommon.js');


const bot = new BotCommon();


// TODO: Tämän jos sisältää tiedostoon, niin tulee virhe nessage oliosta.

class Utils {
	constructor() {
		this._saveMessage = this.saveMessage(message);
		this._syncHistory = this.syncHistory();
		this._getDisplayName = this.getDisplayName(msg);
	}
	/**
	 * Tulkitaan msg-objektista userin nimi/nicki
	 * @param {*} msg
	 */
	getDisplayName(msg) {
		if(msg.channel instanceof Discord.DMChannel) {
			return msg.author.username;
		}
		else {
			return msg.member.displayName;
		}
	}

	/**
	 * Listan sorttaus
	 * @param {*} a
	 * @param {*} b
	 */
	compare(a, b) {
		const ay = a[0].value;
		const by = b[0].value;
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
	syncHistory() {
		bot.getLastID(function(err, lastMsgID) {
			if (err) {
				console.log(err);
			}
			else {
				Utils().syncNewMessages(lastMsgID);
			}
		});
	}

	/**
	 * Haetaan lista montako kertaa sana toistuu eri kanavilla
	 * @param {*} msg
	 * @param {*} strSearch
	 */
	wordCount(msg, strSearch) {
		bot.wordCount(strSearch, function(err, rows) {
			const embed = new Discord.RichEmbed();
			let chanList = '';

			if (err) {
				console.log(err);
			}
			else if (rows) {
				let total = 0;
				let listed = 0;
				embed.setTitle(Utils.getDisplayName(msg) + ' kysyi montako kertaa sana \"**' + strSearch + '**\" esiintyy kanavilla top 10:');
				embed.setAuthor(messisBot.user.username, messisBot.user.displayAvatarURL);
				rows.sort(Utils.compare);
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
					// sentMsg.delete(30000);
				});
				if(!(msg.channel instanceof Discord.DMChannel)) {
					// Komennon poisto ei toimi privachatissa
					msg.delete(2000);
				}
			}
			else {

			}
		});
	}


	/**
	 * Hakee lastMsgID tokenin jälkeen tulleet uudet viestit
	 * @param {*} lastMsgID Tokeni jonka jälkeen tulleita viestejä haetaan
	 */
	syncNewMessages(lastMsgID) {
		const targetChannel = messisBot.channels.get(auth.yleinen);
		targetChannel.fetchMessages({ limit: bot.maxFetch, after: lastMsgID }).then(messages => {
			if (messages.size > 0) {
				bot.log(messages.size.toString() + ' / ' + bot.maxFetch.toString());
			}
			if (messages.size > 0) {
				bot.messagesSynced += messages.size;
				const d = new Date();
				const thisHour = d.getHours();
				if (thisHour !== bot.lastHour) {
					if (bot.messagesSynced > 0) {
						logEvent('Syncronoitu viestejä: ' + bot.messagesSynced.toString());
					}

					bot.lastHour = thisHour;
					bot.messagesSynced = 0;
				}
			}
			const msgArr = messages.array();
			for(let i = 0; i < msgArr.length; i++) {
				Utils.saveMessage(msgArr[i]);
			}
		}).catch(console.error);
	}



	/**
	 * Tallentaa yhden papukaijan tietokantaan
	 * @param {*} message Viestin olio
	 */
	saveParrot(message, channelID) {
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
	 * Tallentaa yhden viestin tietokantaan
	 * @param {*} message Viestin olio
	 */
	saveMessage(message) {
		var con = new Connection(sqlConfig);

		// Ei tallenneta messis botin omia viestejä
		if (message.author.id === auth.messisbot) {
			return;
		}

		// Ei tallenneta bottien omia viestejä.
		if(message.author.bot === Boolean(true)) {
			return;
		}

		if (!message.channel.id) {
			console.log("Channel id is null!");
			return;
		}

		con.on('connect', function(err) {
			if (err) {
				console.log(err);
			} else {
				var request = new Request('up_upd_discord_messages', function(err) {
					if (err) {
						console.log(err);
					}
					con.close();
				});
				var d = message.createdAt;
				// Tehdään itse sopiva datestring muotoa YYYY-MM-DD hh:mm jota mssql syö natiivisti
				var dateString = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
				request.addParameter('iServer_id', TYPES.NVarChar, message.guild.id.toString());
				request.addParameter('iChannel_id', TYPES.NVarChar, message.channel.id.toString());
				request.addParameter('iDiscord_message_id', TYPES.Int, 0);
				request.addParameter('iMessage_id', TYPES.NVarChar, message.id.toString());
				request.addParameter('dtMessage_date', TYPES.DateTime2, dateString);
				request.addParameter('strPerson_name', TYPES.NVarChar, message.author.username);
				request.addParameter('strMessage_text', TYPES.NVarChar, message.content.substring(0,1999));
				request.addParameter('iUser_id', TYPES.NVarChar, message.author.id.toString());
				con.callProcedure(request);
			}
		});
	}


}


module.exports = Utils;