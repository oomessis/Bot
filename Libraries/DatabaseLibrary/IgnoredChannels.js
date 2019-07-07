const app = require("./../../bot.js");
const dataBase = require('./database.js');

/**
 * Class that handles table messis_users DB logic
 */
class IgnoredChannels {
    constructor() {

    }

    /**
     * Read ignored channels list
     * @param {*} callback 
     */
    static getIgnoredChannels(callback) {
        var retval = [];
        let con = new dataBase.Connection(dataBase.sqlConfig);
        con.on('connect', function(err) {
            if (err) {
                return callback(err);
            } else {
                this._request = new dataBase.Request("SELECT discord_channels.channel_id, discord_channels.channel_name FROM messis_ignored_channels INNER JOIN discord_channels ON messis_ignored_channels.discord_channel_id = discord_channels.channel_id ORDER BY discord_channels.channel_name", function(err, rowCount, rows) {
                    if (err) {
                        return callback(err);
                    }
                    con.close();
                    callback(null, retval);
                });
                this._request.on('row', function(columns) {
                    retval.push(columns);
                });
                con.execSql(this._request);
            }
        });
    }

    /**
     * Save messis ignored channel into database
     * @param {*} channelId 
     */
    static save(channelId, callback) {
        let con = new dataBase.Connection(dataBase.sqlConfig);
        con.on('error', function(err) {
			console.log('Connection error: \n' + err);
        });
		con.on('connect', function (err) {
			if (err) {
                console.log(err);
                return callback(err);
			} else {
				let cmd = new dataBase.Request('up_upd_messis_ignored_channel', function (err) {
					if (err) {
                        console.log(err);
                        return callback(err);
					}
                    con.close();
                    callback(null, 1);
                });
                cmd.addParameter('iMessis_ignored_channel_id', dataBase.TYPES.Int, 0);
				cmd.addParameter('strDiscord_Channel_id', dataBase.TYPES.NVarChar, channelId);
                con.callProcedure(cmd);
			}
		});
    }
}
module.exports = IgnoredChannels;