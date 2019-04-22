/*jslint node: true */
"use strict";

const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const app = require("./../../bot.js");

class reactions {
    /**
     * Reaktion lisäyksen käsittely
     * @param {*} packet 
     */
    static handleReactions(packet) {
        let guild = app.client.guilds.get(app.snowflakes.messis);
        let sourceGuild = packet.d.guild_id;
        let channel = app.client.channels.get(packet.d.channel_id);
        let member = guild.members.get(packet.d.user_id);
        if (member.roles.has(app.snowflakes.tuotantotiimi) || member.roles.has(app.snowflakes.yllapito) || app.common.isTuotantotiimiGuild(sourceGuild) || member.roles.has(app.snowflakes.paimen)) {
            channel.fetchMessage(packet.d.message_id).then(message => {
                //const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
                //const reaction = message.reactions.get(emoji);
                if (packet.d.emoji.name === 'juttu') {
                    app.bot.parroExists(message.author.id, message.id, function(err, parrotID) {
                        if (err) {
                            console.log(err);
                        } else {
                            if(parrotID === -1) {
                                let me = new reactions();
                                me.saveParrot(message, channel.id);
                                me.toimitusPapukaija(channel.name, message);
                            }
                        }
                    });
                } else if (packet.d.emoji.name === 'tietohallinto') {
                    app.client.channels.filter(
                        ch => ch.id === app.snowflakes.channels.find(e => e.name === 'TietohallintoFeed').id
                    ).map(
                        async channelPh => await channelPh.send(app.common.announcementFromMessage(message))
                    );
                } else if (packet.d.emoji.name === 'toimitus') {
                    app.client.channels.filter(
                        ch => ch.id === app.snowflakes.channels.find(e => e.name === 'ToimitusFeed').id
                    ).map(
                        async channelPh => await channelPh.send(app.common.announcementFromMessage(message))
                    );
                } else if (packet.d.emoji.name === 'ohjelma') {
                    app.client.channels.filter(
                        ch => ch.id === app.snowflakes.channels.find(e => e.name === 'OhjelmaFeed').id
                    ).map(
                        async channelPh => await channelPh.send(app.common.announcementFromMessage(message))
                    );
                } else if (packet.d.emoji.name === 'staffi') {
                    app.client.channels.filter(
                        ch => ch.id === app.snowflakes.channels.find(e => e.name === 'StaffiFeed').id
                    ).map(
                        async channelPh => await channelPh.send(app.common.announcementFromMessage(message))
                    );
                }
            });
        }
    }

    /**
     * Tallentaa yhden papukaijan tietokantaan
     * @param {*} message Viestin olio
     */
    saveParrot(message, channelID) {
        let con = new Connection(app.sqlConfig);
        con.on('connect', function (err) {
            if (err) {
                console.log(err);
            } else {
                let request = new Request('up_upd_parrot', function (err) {
                    if (err) {
                        console.log(err);
                    }
                    con.close();
                });
                // Tehdään itse sopiva datestring muotoa YYYY-MM-DD hh:mm jota mssql syö natiivisti
                let d = message.createdAt;
                let dateString = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                request.addParameter('iParrot_id', TYPES.Int, 0);
                request.addParameter('iUser_id', TYPES.NVarChar, message.author.id);
                request.addParameter('iMessage_id', TYPES.NVarChar, message.id.toString());
                request.addParameter('dtMessage_date', TYPES.DateTime2, dateString);
                request.addParameter('strPerson_name', TYPES.NVarChar, message.author.username);
                request.addParameter('strMessage_text', TYPES.NVarChar, message.content.substring(0, 1999));
                request.addParameter('strMessage_url', TYPES.NVarChar, message.url.substring(0, 199));
                request.addParameter('iChannel_id', TYPES.NVarChar, channelID.toString());
                con.callProcedure(request);
            }
        });
    }

    /**
     * Badgeviesti toimitukselle & yhteisölle
     * @param {*} channelName
     * @param {*} announcement
     * @param {*} message
     */
    toimitusPapukaija(channelName, message) {
        let announcement = app.common.announcementFromMessage(message);
        // Automaatio
        app.bot.logEvent(announcement);
        // Yleinen kanavalle
        app.client.channels.filter(chYl => chYl.id === app.snowflakes.yleinen).map(async chYleinen => await chYleinen.send(announcement));
        // Puheenaiheet kanavalle
        app.client.channels.filter(chPh => chPh.id === app.snowflakes.puheenaiheet).map(async channelPh => await channelPh.send(announcement));
        // Toimitusservun puheenaiheet kanavalle
        app.client.channels.filter(chTo => chTo.id === app.snowflakes.toimituspapukaija).map(async chToimitus => await chToimitus.send(announcement));
    }
}
module.exports = reactions;