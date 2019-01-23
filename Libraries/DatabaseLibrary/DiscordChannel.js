var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var sqlConfig = require('../../auth/azureauth.json');
var TYPES = require('tedious').TYPES;

class DiscordChannel {
    constructor() {
        this._discordChannelID = 0;
        this._serverID = '';
        this._channelID = '';
        this._channelName = '';
        this._dirty = false;
        this._new = true;
    }

    /**
     * DB identiteetti
     */
    set discordChannelID(value) {
        if (this._discordChannelID !== value) {
            this._discordChannelID = value;
            this.markDirty();
        }
    }
    get discordChannelID() {
        return this._discordChannelID;
    }

    /**
     * Serverin ID (snowflake)
     */
    set serverID(value) {
        if (this._serverID !== value) {
            this._serverID = value;
            this.markDirty();
        }
    }
    get serverID() {
        return this._serverID;
    }

    /**
     * Kanavan ID (snowflake)
     */
    set channelID(value) {
        if (this._channelID !== value) {
            this._channelID = value;
            this.markDirty();
        }
    }
    get channelID() {
        return this._channelID;
    }

    /**
     * Kanavan nimi (snowflake)
     */
    set channelName(value) {
        if (this._channelName !== value) {
            this._channelName = value;
            this.markDirty();
        }
    }
    get channelName() {
        return this._channelName;
    }




    markDirty() {
        this._dirty = true;
    }
}
module.exports = DiscordChannel;