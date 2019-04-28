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
            if (member.roles.has(app.snowflakes.tuotantotiimi) || member.roles.has(app.snowflakes.yllapito) || app.common.isTuotantotiimiGuild(sourceGuild) || member.roles.has(app.snowflakes.paimen)) {
                // Reaktion on joko:
                // - Tuotantotiimiläisen antama
                // - Rooliriippumattomasti annettu tuotantotiimin tiimiservuilla
                // - Paimenen antama

                // Puheenaihe-badge
                if (packet.d.emoji.name === 'juttu') {
                    badges.saveConversation(message);
                    let me = new reactions();
                    me.puheenaiheIlmoitukset(message);

                } else if (packet.d.emoji.name === 'idea') {
                    badges.saveIdea(message);
                    let me = new reactions();
                    me.ideaIlmoitukset(message);

                } else if (packet.d.emoji.name === 'lainaus') {
                    badges.saveQuote(message);
                    let me = new reactions();
                    me.quoteIlmoitukset(message);
                } 
            }
            if (member.roles.has(app.snowflakes.tuotantotiimi) || member.roles.has(app.snowflakes.yllapito) || app.common.isTuotantotiimiGuild(sourceGuild)) {
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
                }
            }
        });
    }

    /**
     * Puheenaihe-badgesta ilmoitus toimitukselle & yhteisölle
     * @param {*} message
     */
    puheenaiheIlmoitukset(message) {
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
    ideaIlmoitukset(message) {
        let announcement = "Ideabadge ansaittu. " + app.common.announcementFromMessage(message);
        // Ideat kanavalle
        app.client.channels.filter(ch => ch.id === app.snowflakes.ideakanava).map(async chIdea => await chIdea.send(announcement));
    }

    /**
     * Quote-badgesta ilmoitus toimitukselle
     * @param {*} message 
     */
    quoteIlmoitukset(message) {
        let announcement = "Quotebadge ansaittu. " + app.common.announcementFromMessage(message);
        // Quotet kanavalle
        app.client.channels.filter(ch => ch.id === app.snowflakes.quotekanava).map(async chQuote => await chQuote.send(announcement));
    }
}
module.exports = reactions;