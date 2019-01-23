var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var sqlConfig = require('../../auth/azureauth.json');
var TYPES = require('tedious').TYPES;

class DataBase {
    constructor() {

    }
    
    /**
     * Hakee tietokannasta viestien lukumäärän
     * @param {*} callback 
     */
    fetchMessageCount(callback) {
        var msgCount = '';
        var con = new Connection(sqlConfig);
        con.on('connect', function(err) {
            if (err) {
                return callback(err);
            } else {
                this._request = new Request("SELECT COUNT(*) AS cnt FROM discord_messages WHERE person_name not like 'Messis Bot'", function(err, rowCount) {
                    if (err) {
                        return callback(err);
                    }
                    con.close();
                    callback(null, msgCount);
                });
                this._request.on('row', function(columns) {
                    columns.forEach(function(column) {
                        if (column.value !== null) {
                            msgCount = column.value;
                        }
                    });
                });
                con.execSql(this._request);
            }
        });
    }

    /**
     * Hakee tietokannasta viimeisimmän viestin tokenin
     * @param {*} callback 
     */
    fetchLastID(callback) {
        var lastMsgID = '';
        var con = new Connection(sqlConfig);
        con.on('connect', function(err) {
            if (err) {
                return callback(err);
            } else {
                this._request = new Request("SELECT TOP 1 message_id FROM discord_messages ORDER BY message_date DESC", function(err, rowCount) {
                    if (err) {
                        return callback(err);
                    }
                    con.close();
                    callback(null, lastMsgID);
                });
                this._request.on('row', function(columns) {
                    columns.forEach(function(column) {
                        if (column.value !== null) {
                            lastMsgID = column.value;
                        }
                    });
                });
                con.execSql(this._request);
            }
        });
    }

    /**
     * Hakee tietokannasta käyttäjänimen viestien lukumäärän
     * @param {*} userID 
     * @param {*} callback 
     */
    fetchUserMessageCount(userID, callback) {
        var retval = [];
        var con = new Connection(sqlConfig);
        con.on('connect', function(err) {
            if (err) {
                return callback(err);
            } else {
                var sql = 'select count(*) cnt, channel_name from discord_messages dm inner join discord_channels dc on dm.channel_id = dc.channel_id where [user_id] = @userID group by dc.channel_name order by cnt desc';
                this._request = new Request(sql, function(err, rowCount, rows) {
                    if (err) {
                        return callback(err);
                    }
                    con.close();
                    callback(null, retval);
                });
                this._request.addParameter('userID', TYPES.VarChar, userID);
                this._request.on('row', function(columns) {
                    retval.push(columns);
                });
                con.execSql(this._request);
            }
        });
    }

    /**
     * Hakee tietokannasta viimeisimmän viestin tokenin
     * @param {*} callback 
     */
    parroExists(userID, msgID, callback) {
        var parrotID = -1;
        var con = new Connection(sqlConfig);
        con.on('connect', function(err) {
            if (err) {
                return callback(err);
            } else {
                this._request = new Request("select parrot_id from parrots where user_id = '" + userID + "' and message_id = '" + msgID + "'", function(err, rowCount) {
                    if (err) {
                        return callback(err);
                    }
                    con.close();
                    callback(null, parrotID);
                });
                this._request.on('row', function(columns) {
                    columns.forEach(function(column) {
                        if (column.value !== null) {
                            parrotID = column.value;
                        }
                    });
                });
                con.execSql(this._request);
            }
        });
    }

    /**
     * Laskee montako kertaa hakusana esiintyy
     * @param {*} searchWord 
     * @param {*} callback 
     */
    wordCount(searchWord, callback) {
        var retval = [];
        var con = new Connection(sqlConfig);
        con.on('connect', function(err) {
            if (err) {
                return callback(err);
            } else {
                this._request = new Request("up_sel_wordcount", function(err, rowCount, rows) {
                    if (err) {
                        return callback(err);
                    }
                    con.close();
                    callback(null, retval);
                });
                this._request.addParameter('strSearch', TYPES.NVarChar, searchWord.substring(0,199));
                this._request.on('row', function(columns) {
                    retval.push(columns);
                });
                con.callProcedure(this._request);
            }
        });
    }

    /**
     * Haetaan kanavat kannasta listaan
     */
    getChannels(callback) {
        var retval = [];
        var con = new Connection(sqlConfig);
        con.on('connect', function(err) {
            if (err) {
                return callback(err);
            } else {
                this._request = new Request("select * from discord_channels", function(err, rowCount, rows) {
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

}
module.exports = DataBase;