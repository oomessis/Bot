const app = require("./../../bot.js");
const dataBase = require('./database.js');

/**
 * Class that handles table messis_users DB logic
 */
class MessisUser {
    constructor() {
        this.ID = 0;
        this.DiscordUserID = '';
        this.DiscordUserName = '';
        this.DiscordJoinedAt = '';
    }

    /**
     * Read user by Discord ID from database
     * @param {*} discordUserId 
     * @param {*} callback 
     */
    static getUserByDiscordID(discordUserId, callback) {
        let con = new dataBase.Connection(dataBase.sqlConfig);
        let oUser = new MessisUser();
        con.on('connect', function(err) {
            if (err) {
                return callback(err);
            } else {
                this._request = new dataBase.Request("select * from messis_users where discord_user_id = @strDiscordUserID", function(err, rowCount, rows) {
                    if (err) {
                        return callback(err);
                    }
                    con.close();
                    callback(null, oUser);
                });
                this._request.addParameter('strDiscordUserID', dataBase.TYPES.NVarChar, discordUserId);
                this._request.on('row', function(columns) {
                    oUser.ID = columns[0].value;
                    oUser.DiscordUserID = columns[1].value;
                    oUser.DiscordUserName = columns[2].value;
                });
                con.execSql(this._request);
            }
        });
    }

    /**
     * Save messis user into database
     * @param {*} userId 
     * @param {*} userName 
     */
    static save(userId, userName, joinedAt, callback) {
        let con = new dataBase.Connection(dataBase.sqlConfig);
        con.on('error', function(err) {
			console.log('Connection error: \n' + err);
        });
		con.on('connect', function (err) {
			if (err) {
                console.log(err);
                return callback(err);
			} else {
				let cmd = new dataBase.Request('up_upd_messis_user', function (err) {
					if (err) {
                        console.log(err);
                        return callback(err);
					}
                    con.close();
                    callback(null, 1);
                });
                cmd.addParameter('iMessis_user_id', dataBase.TYPES.Int, 0);
				cmd.addParameter('strDiscord_user_id', dataBase.TYPES.NVarChar, userId);
                cmd.addParameter('strDiscord_user_name', dataBase.TYPES.NVarChar, userName);
                cmd.addParameter('dtDiscord_joined_at', dataBase.TYPES.DateTime2, app.common.toISODateString(joinedAt));
                con.callProcedure(cmd);
			}
		});
    }
}
module.exports = MessisUser;