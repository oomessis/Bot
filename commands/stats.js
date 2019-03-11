const messisBot = require('../bot.js');
const logEvent = require('../Libraries/BotLibrary/utils.js');
const Discord = require('discord.js');
const Utils = require('../Libraries/BotLibrary/utils.js');
const create = require('../Libraries/BotLibrary/utils.js');
const auth = require('../auth/auth.json');
const BotCommon = require('../Libraries/BotLibrary/botcommon');

let userName = '';

const bot = new BotCommon();

const utils = create();


module.exports = {
	name: 'avatar',
	execute(msg, args) {
		userName = msg.content.substring(8);
		userTest(msg, userName);
	},
};

module.exports = {
	name: 'sana',
	execute(msg, args) {
		const strSearch = msg.content.substring(6);
		if (!this.countingWords) {
			wordCount(msg, strSearch);
		}
	},
};

module.exports = {
	name: 'stat',
	execute(msg, args) {
		userStat(msg);
	},
};


/**
 * Haetaan lista montako kertaa sana toistuu eri kanavilla
 * @param {*} msg
 * @param {*} strSearch
 */
function wordCount(msg, strSearch) {
	messisBot.wordCount(strSearch, function(err, rows) {
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
 * Näyttää privaviestinä jäsenen avatar-urlin komennon antajalle
 * @param {*} msg
 * @param {*} u
 */
function userTest(msg, u) {
	utils.logEvent("Avatar käyttäjästä " + u + " : " + msg.author.username);
	const guild = messisBot.guilds.get(auth.messis);
	guild.members.filter(m => m.user.username === u).map(member => {
		msg.author.send(u + ' käyttäjän avatar url: ' + member.user.avatarURL);
	});
}


/**
 * Statistiikkaa, kertoo montako viestiä on kanavalla ja montako kutsun antaneella jäsenellä
 * @param {*} msg
 */
function userStat(msg) {
	logEvent('Statistiikkaa käyttäjälle: ' + (msg));
	bot.getLastID(function(err, lastMsgID) {
		utils.syncNewMessages(lastMsgID);
		bot.messageCount(function(err, totalAllChannels) {
			if (err) {
				console.log(err);
			}
			else {
				bot.userMessageCount(msg.author.id, function(err, totalUserList) {
					if (err) {
						console.log(err);
					}
					else if (totalUserList) {
						const embed = new Discord.RichEmbed();
						let total = 0;
						let listed = 0;
						let chanList = '';
						let percent = 0;
						embed.setTitle('Käyttäjän `' + utils.getDisplayName(msg) + '` viestien statistiikkaa top 10:');
						embed.setAuthor(messisBot.user.username, messisBot.user.displayAvatarURL);
						totalUserList.sort(utils.compare);
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
							// sentMsg.delete(30000);
						});
						if(!(msg.channel instanceof Discord.DMChannel)) {
							// Komennon poisto ei toimi privachatissa
							msg.delete(2000);
						}
					}
				});
			}
		});
	});
}