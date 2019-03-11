/*jslint node: true */
'use strict';
const DataBase = require('../DatabaseLibrary/database.js');
const DiscordMessage = require('../DatabaseLibrary/DiscordMessage.js');

/**
 * Luokka botin yleisille muuttujille niin saadaan ne pois global scopesta
 */
class BotCommon {
	constructor() {
		this._maxFetch = 100;
		this._lastID = 0;
		this._lastHour = -1;
		this._messagesSynced = 0;
		this._DB = new DataBase();
		this._Discord = new DiscordMessage();

		this.channels = [];
		this.bulkIndex = 0;
	}

	/**
	 * Montako viestiä maksimissaan ladataan
	 */
	set maxFetch(value) {
		this._maxFetch = value;
	}

	get maxFetch() {
		return this._maxFetch;
	}

	/**
	 * Mikä oli viimeisin ID historian latauksessa
	 */
	set lastID(value) {
		this._lastID = value;
	}

	get lastID() {
		return this._lastID;
	}

	/**
	 * Tokeni intervalille jolla haetaan bulkkina viestihistoriaa
	 */
	set bulkInterval(value) {
		this._bulkInterval = value;
	}

	get bulkInterval() {
		return this._bulkInterval;
	}

	/**
	 * Tokeni intervalille jolla haetaan syncronointia viestimaarista
	 */
	set syncInterval(value) {
		this._syncInterval = value;
	}

	get syncInterval() {
		return this._syncInterval;
	}

	/**
	 * Tunti jolloin viimeksi raportoitiin
	 */
	set lastHour(value) {
		this._lastHour = value;
	}

	get lastHour() {
		return this._lastHour;
	}

	/**
	 * Montako viestiä syncattu viimeisen raportoinnin jälkeen
	 */
	set messagesSynced(value) {
		this._messagesSynced = value;
	}

	get messagesSynced() {
		return this._messagesSynced;
	}

	getLastID(callback) {
		this._DB.fetchLastID(function(err, lastID) {
			if (err) {
				console.log(err);
			}
			else {
				callback(null, lastID);
			}
		});
	}

	messageCount(callback) {
		this._DB.fetchMessageCount(function(err, total) {
			if (err) {
				console.log(err);
			}
			else {
				callback(null, total);
			}
		});
	}

	userMessageCount(userID, callback) {
		this._DB.fetchUserMessageCount(userID, function(err, msgCountList) {
			if (err) {
				console.log(err);
			}
			else {
				callback(null, msgCountList);
			}
		});
	}

	parroExists(userID, msgID, callback) {
		this._DB.parroExists(userID, msgID, function(err, parrotID) {
			if (err) {
				console.log(err);
			}
			else {
				callback(null, parrotID);
			}
		});
	}

	wordCount(strSearch, callback) {
		this._DB.wordCount(strSearch, function(err, rows) {
			if (err) {
				console.log(err);
			}
			else {
				callback(null, rows);
			}
		});
	}

	getChannels(callback) {
		this._DB.getChannels(function(err, channels) {
			if (err) {
				console.log(err);
			}
			else {
				callback(null, channels);
			}
		});
	}

	getPABadgeScoreList(callback) {
		this._DB.getPABadgeScoreList(function(err, scoreList) {
			if (err) {
				console.log(err);
			}
			else {
				callback(null, scoreList);
			}
		});
	}

	getPAUserBadges(strUserName, callback) {
		this._DB.getPAUserBadges(strUserName, function(err, badges) {
			if (err) {
				console.log(err);
			}
			else {
				callback(null, badges);
			}
		});
	}

	getChannelBadges(strChannelName, callback) {
		this._DB.getChannelBadges(strChannelName, function(err, badges) {
			if (err) {
				console.log(err);
			}
			else {
				callback(null, badges);
			}
		});
	}

	/**
	 * Botin oma console.log()
	 * @param {*} msg
	 */
	log(msg) {
		const d = new Date();
		console.log(d.toString() + ': ' + msg);
	}
}

module.exports = BotCommon;