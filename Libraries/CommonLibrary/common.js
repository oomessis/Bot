/*jslint node: true */
"use strict";
const Discord = require('discord.js');
const auth = require('./../../auth/auth.json');
const snowflakes = require('./../../auth/snowflakes.json');

class commonClass {
	/**
	 * Luodaan huomioviesti discord viestistä
	 * @param {*} message 
	 */
	static announcementFromMessage(message) {
		let content = message.content.split('`').join(''); // Embediin viestisisältö josta stripattu embedimerkit
		return 'Kanavalla: ' + message.channel + ' ' + 'käyttäjä: '+  message.author + '\n<' + message.url + '>' +  '\n```' + content + '```';
	}

	/**
	 * Tulkitaan msg-objektista userin nimi/nicki
	 * @param {*} msg
	 */
	static getDisplayName(msg) {
		if (msg.channel instanceof Discord.DMChannel) {
			return msg.author.username;
		} else {
			return msg.member.displayName;
		}
	}

	/**
	 * Listan sorttaus
	 * @param {*} a
	 * @param {*} b
	 */
	static compare(a, b) {
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
	 * Prefiksin käsittely, parsitaan itse komento, palautetaan tyhjä jos prefix ei täsmää
	 * @param {*} arg
	 */
	static getCommand(arg) {
		if (arg.substring(0, 1) === auth.prefix) {
			return arg.substring(1);
		}
		return '';
	}

	/**
	 * Onko annettu kilta tuotantotiimin kiltoja
	 * @param {*} guildID 
	 */
	static isTuotantotiimiGuild(guildID) {
		let guild = snowflakes.servers.find(e => e.id === guildID);
		if (guild) {
			return guild.tuotanto;
		} else {
			return false;
		}
	}

	/**
	 * Oma purkkaviritys datestringille
	 * @param {*} d 
	 */
	static toISODateString(d) {
		if (!d)	return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
		return d;
	}
}
module.exports = commonClass;
