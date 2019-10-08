/*jslint node: true */
"use strict";

const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const app = require("./../../bot.js");
const badges = require('./../DatabaseLibrary/Badges.js');

/**
 * Reaktioiden käsittely
 */
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
        channel.fetchMessage(packet.d.message_id).then(message => {
            if (member.roles.has(app.snowflakes.tuotantotiimi) || member.roles.has(app.snowflakes.yllapito) || app.common.isTuotantotiimiGuild(sourceGuild) || member.roles.has(app.snowflakes.paimen) || member.roles.has(app.snowflakes.vaikuttaja)) {
                // Reaktion on joko:
                // - Tuotantotiimiläisen antama
                // - Rooliriippumattomasti annettu tuotantotiimin tiimiservuilla
                // - Paimenen antama
                // - Vaikuttajan antama

                // Puheenaihe-badge
                if (packet.d.emoji.name === 'juttu') {
                    badges.saveConversation(message);
                }
            }

            if (member.roles.has(app.snowflakes.tuotantotiimi) || member.roles.has(app.snowflakes.yllapito) || app.common.isTuotantotiimiGuild(sourceGuild) || member.roles.has(app.snowflakes.paimen)) {
                // Reaktion on joko:
                // - Tuotantotiimiläisen antama
                // - Rooliriippumattomasti annettu tuotantotiimin tiimiservuilla
                // - Paimenen antama

                if (packet.d.emoji.name === 'idea') {
                    badges.saveIdea(message);

                } else if (packet.d.emoji.name === 'lainaus') {
                    badges.saveQuote(message);

                } else if (packet.d.emoji.name === 'kultainensydan') {
                    badges.saveGoldenHeart(message);
                    
                }
                
                // Reaktio on tuotantotiimiläisen antama tai tuotantotiimin tiimiservuilla annettu
                if (packet.d.emoji.name === 'tietohallinto') {
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
                } else if (packet.d.emoji.name === 'mu') {
                    app.client.channels.filter(
                        ch => ch.id === app.snowflakes.channels.find(e => e.name === 'ToimitusUutisFeed').id
                    ).map(
                        async channelFeed => await channelFeed.send(app.common.announcementFromMessage(message))
                    );
                }
            }
        });
    }
}
module.exports = reactions;