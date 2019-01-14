"use strict";
var DataBase = require('../DatabaseLibrary/database.js');
var DiscordMessage = require('../DiscordLibrary/DiscordMessage.js');

/**
 * Luokka botin yleisille muuttujille niin saadaan ne pois global scopesta
 */
class BotCommon {
    constructor() {
        this._maxFetch = 100;
        this._lastID = 0;
        this._DB = new DataBase();
        this._Discord = new DiscordMessage();
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

    getLastID(callback) {
        this._DB.fetchLastID(function(err, lastID) {
            callback(null, lastID);
        });
    }

    messageCount(callback) {
        this._DB.fetchMessageCount(function(err, total) {
            callback(null, total);
        });
    }

    userMessageCount(userName, callback) {
        this._DB.fetchUserMessageCount(userName, function(err, msgCount) {
            callback(null, msgCount);
        });
    }

    parroExists(userID, msgID, callback) {
        this._DB.parroExists(userID, msgID, function(err, parrotID) {
            callback(null, parrotID);
        });
    }

}
module.exports = BotCommon;