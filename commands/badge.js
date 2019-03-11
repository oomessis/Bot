const bot = require('../bot.js');
const Discord = require('discord.js');

let userName = '';

module.exports = {
	name: 'badgescores',
	execute(msg, args) {
		badgeScoreList(msg);
	},
};

module.exports = {
	name: 'badgelist',
	execute(msg, args) {
		userName = msg.content.substring(11);
		badgeList(msg, userName);
	},
};


module.exports = {
	name: 'channelbadgelist',
	execute(msg, args) {
		const channelName = msg.content.substring(18);
		channelBadgeList(msg, channelName);
	},
};


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
			let badgeList = 'Badgelistaus kanavahaulla: `' + channelName + '`:\n\n';
			rows.forEach(cols => {
				badgeList = '`' + cols[0].value.toString() + '`: ' + cols[2].value + '\n' + '' + cols[1].value + '\n\n';
				msg.channel.send(badgeList.substring(0, 1999));
			});
			if(!(msg.channel instanceof Discord.DMChannel)) {
				msg.delete(2000);
			}
		}
	});
}