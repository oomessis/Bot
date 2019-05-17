const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const sqlConfig = require('../../auth/azureauth.json');
const enum_badge = require('../../assets/badges.json');
const app = require("./../../bot.js");

/**
 * Badge ilmoitus & tietokantatoiminnallisuudet
 */
class Badges {

    /**
     * Tallentaa yhden puheenaihebadgen tietokantaan
     * @param {*} message Viestin olio
     */
    static saveConversation(message) {
        let badge = new Badges();
        badge._exists(enum_badge.puheenaihe, message.author.id, message.id, function(err, badgeID) {
            if (err) { console.log(err); } else {
                if(badgeID === -1) {
                    app.bot.logEvent("Puheenaihebadge käyttäjälle: " + message.author.username + " tallennettu kantaan.");
                    badge._save(enum_badge.puheenaihe, message);
                    badge._puheenaiheIlmoitukset(message);
                }
            }
        });
    }

    /**
     * Tallentaa yhden ideabadgen tietokantaan
     * @param {*} message 
     */
    static saveIdea(message) {
        let badge = new Badges();
        badge._exists(enum_badge.idea, message.author.id, message.id, function(err, badgeID) {
            if (err) { console.log(err); } else {
                if(badgeID === -1) {
                    app.bot.logEvent("Ideabadge käyttäjälle: " + message.author.username + " tallennettu kantaan.");
                    badge._save(enum_badge.idea, message);
                    badge._ideaIlmoitukset(message);
                }
            }
        });
    }

    /**
     * Tallentaa yhden lainausbadgen tietokantaan
     * @param {*} message 
     */
    static saveQuote(message) {
        let badge = new Badges();
        badge._exists(enum_badge.lainaus, message.author.id, message.id, function(err, badgeID) {
            if (err) { console.log(err); } else {
                if(badgeID === -1) {
                    app.bot.logEvent("Lainausbadge käyttäjälle: " + message.author.username + " tallennettu kantaan.");
                    badge._save(enum_badge.lainaus, message);
                    badge._quoteIlmoitukset(message);
                }
            }
        });
    }

    /**
     * Varsinainen Badgen tallennus kantaan
     * @param {*} type 
     * @param {*} message 
     */
    _save(type, message) {
        let con = new Connection(app.sqlConfig);
        con.on('connect', function (err) {
            if (err) {
                console.log(err);
            } else {
                let request = new Request('up_upd_badge', function (err) {
                    if (err) {
                        console.log(err);
                    }
                    con.close();
                });
                // Tehdään itse sopiva datestring muotoa YYYY-MM-DD hh:mm jota mssql syö natiivisti
                let d = message.createdAt;
                let dateString = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                request.addParameter('iBadge_id', TYPES.Int, 0);
                request.addParameter('iBadge_type', TYPES.Int, type);
                request.addParameter('iGuild_id', TYPES.NVarChar, message.guild.id.toString());
                request.addParameter('iChannel_id', TYPES.NVarChar, message.channel.id.toString());
                request.addParameter('iMessage_id', TYPES.NVarChar, message.id.toString());
                request.addParameter('iUser_id', TYPES.NVarChar, message.author.id.toString());
                request.addParameter('strPerson_name', TYPES.NVarChar, message.author.username);
                request.addParameter('dtMessage_date', TYPES.DateTime2, dateString);
                request.addParameter('strMessage_url', TYPES.NVarChar, message.url.substring(0, 199));
                con.callProcedure(request);
            }
        });
    }

    /**
     * Tarkistetaan löytyykö badge jo
     * @param {*} type 
     * @param {*} userID 
     * @param {*} msgID 
     * @param {*} callback 
     */
    _exists(type, userID, msgID, callback) {
        let badgeID = -1;
        let con = new Connection(sqlConfig);
        con.on('connect', function(err) {
            if (err) {
                return callback(err);
            } else {
                this._request = new Request("select badge_id from messis_badges where badge_type = " + type + " and user_id = '" + userID + "' and message_id = '" + msgID + "'", function(err, rowCount) {
                    if (err) {
                        return callback(err);
                    }
                    con.close();
                    callback(null, badgeID);
                });
                this._request.on('row', function(columns) {
                    columns.forEach(function(column) {
                        if (column.value !== null) {
                            badgeID = column.value;
                        }
                    });
                });
                con.execSql(this._request);
            }
        });
    }

    /**
     * Puheenaihe-badgesta ilmoitus toimitukselle & yhteisölle
     * @param {*} message
     */
    _puheenaiheIlmoitukset(message) {
        let announcement = "Puheenaihebadge ansaittu. " + app.common.announcementFromMessage(message);
        // Automaatio
        app.bot.logEvent(announcement);
        // Yleinen kanavalle
        app.client.channels.filter(chYl => chYl.id === app.snowflakes.yleinen).map(async chYleinen => await chYleinen.send(announcement));
        // Puheenaiheet kanavalle
        app.client.channels.filter(chPh => chPh.id === app.snowflakes.puheenaiheet).map(async channelPh => await channelPh.send(announcement));
        // Toimitusservun puheenaiheet kanavalle
        app.client.channels.filter(chTo => chTo.id === app.snowflakes.toimituspapukaija).map(async chToimitus => await chToimitus.send(announcement));
    }

    /**
     * Idea-badgesta ilmoitus yhteisölle 
     * @param {*} message 
     */
    _ideaIlmoitukset(message) {
        let announcement = "Ideabadge ansaittu. " + app.common.announcementFromMessage(message);
        // Ideat kanavalle
        app.client.channels.filter(ch => ch.id === app.snowflakes.ideakanava).map(async chIdea => await chIdea.send(announcement));
    }

    /**
     * Quote-badgesta ilmoitus toimitukselle
     * @param {*} message 
     */
    _quoteIlmoitukset(message) {
        let announcement = "Quotebadge ansaittu. " + app.common.announcementFromMessage(message);
        // Quotet kanavalle
        app.client.channels.filter(ch => ch.id === app.snowflakes.quotekanava).map(async chQuote => await chQuote.send(announcement));
    }

}
module.exports = Badges;