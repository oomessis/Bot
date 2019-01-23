var DiscordChannel = require('../DatabaseLibrary/DiscordChannel.js');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var sqlConfig = require('../../auth/azureauth.json');
var TYPES = require('tedious').TYPES;

class DiscordChannelList {
    constructor() {
        this._channels = [];
    }

    get channels() {
        return this._channels;
    }


}
module.exports = DiscordChannelList;