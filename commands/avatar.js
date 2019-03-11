const Utils = require('../Libraries/BotLibrary/utils.js');
const bot = require('../bot.js');
const messisBot = require('../bot.js');
const auth = require('../auth/auth.json');


let userName = '';

module.exports = {
	name: 'avatar',
	execute(msg, args) {
		userName = msg.content.substring(8);
		userTest(msg, userName);
	},
};

/**
 * Näyttää privaviestinä jäsenen avatar-urlin komennon antajalle
 * @param {*} msg
 * @param {*} u
 */
function userTest(msg, u) {
	Utils.logEvent('Avatar käyttäjästä ' + u + ' : ' + msg.author.username);
	const guild = messisBot.guilds.get(auth.messis);
	guild.members.filter(m => m.user.username === u).map(member => {
		msg.author.send(u + ' käyttäjän avatar url: ' + member.user.avatarURL);
	});
}