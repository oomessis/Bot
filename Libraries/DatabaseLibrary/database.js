var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var sqlConfig = require('../../auth/sqlauth.json');
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
     * @param {*} userName 
     * @param {*} callback 
     */
    fetchUserMessageCount(userName, callback) {
        var con = new Connection(sqlConfig);
        var msgCount = 0;
        con.on('connect', function(err) {
            if (err) {
                return callback(err);
            } else {
                var sql = 'SELECT COUNT(*) AS messageCount FROM discord_messages WHERE person_name = @userName';
                this._request = new Request(sql, function(err, rowCount) {
                    if (err) {
                        return callback(err);
                    }
                    con.close();
                    callback(null, msgCount);
                });
                this._request.addParameter('userName', TYPES.VarChar, userName);
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

}
module.exports = DataBase;