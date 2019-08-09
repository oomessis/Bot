const dataBase = require('./database.js');

/**
 * Class that handles table messis_users_tags DB logic
 */
class MessisUserTags {
    /**
     * Get list of tags by user ID
     * @param {*} messisUserId 
     * @param {*} callback 
     */
    static getUserTags(messisUserId, callback) {
        let con = new dataBase.Connection(dataBase.sqlConfig);
        let colTags = [];
        con.on('connect', function(err) {
            if (err) {
                return callback(err);
            } else {
                this._request = new dataBase.Request("select * from messis_users_tags where messis_user_id = @iMessisUserID", function(err, rowCount, rows) {
                    if (err) {
                        return callback(err);
                    }
                    con.close();
                    callback(null, colTags);
                });
                this._request.addParameter('iMessisUserID', dataBase.TYPES.Int, messisUserId);
                this._request.on('row', function(columns) {
                    colTags.push(columns[2].value);
                });
                con.execSql(this._request);
            }
        });
    }

    /**
     * Save list of tags for user ID
     * @param {*} messisUserId 
     * @param {*} tags 
     * @param {*} callback 
     */
    static saveUserTags(messisUserId, tags, callback) {
        let con = new dataBase.Connection(dataBase.sqlConfig);
        con.on('error', function(err) {
			console.log('Connection error: \n' + err);
        });
		con.on('connect', function (err) {
			if (err) {
                console.log(err);
                return callback(err);
			} else {
				let cmd = new dataBase.Request('up_add_messis_user_tags', function (err) {
					if (err) {
                        console.log(err);
                        return callback(err);
					}
                    con.close();
                    callback(null, 1);
				});
                cmd.addParameter('iMessis_user_id', dataBase.TYPES.Int, messisUserId);
				cmd.addParameter('strTags', dataBase.TYPES.NVarChar, tags);
                con.callProcedure(cmd);
			}
		});
    }

    /**
     * Get list of users having given tag
     */
    static getUsersByTag(tag, callback) {
        let con = new dataBase.Connection(dataBase.sqlConfig);
        let colUsers = [];
        con.on('connect', function(err) {
            if (err) {
                return callback(err);
            } else {
                this._request = new dataBase.Request("select mu.discord_user_name from messis_users_tags mut inner join messis_users mu on mu.messis_user_id = mut.messis_user_id where mut.tag = @strTag", function(err, rowCount, rows) {
                    if (err) {
                        return callback(err);
                    }
                    con.close();
                    callback(null, colUsers);
                });
                this._request.addParameter('strTag', dataBase.TYPES.NVarChar, tag);
                this._request.on('row', function(columns) {
                    colUsers.push(columns[0].value);
                });
                con.execSql(this._request);
            }
        });
    }
}
module.exports = MessisUserTags;