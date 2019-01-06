var discordMessage = require('./Libraries/DiscordLibrary/DiscordMessage.js');
var util = require('util');
var fs = require('fs');
var Flatted = require('flatted');
var Discord = require('discord.js');
var logger = require('winston');
var auth = require('./auth/auth.json');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var sqlAuth = require('./auth/sqlauth.json');
var BotCommon = require('./Libraries/BotLibrary/botcommon.js')

var bot = new BotCommon();

var sqlConfig = sqlAuth;

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

var messisBot = new Discord.Client();
messisBot.on('ready', () => {

});

messisBot.on('error', () => console.log('errored'));
messisBot.login(auth.token);

messisBot.on('message', msg => {
    var bPrivate = false;
    var argv = msg.content.split(' ');
    
    if(msg.channel instanceof Discord.DMChannel) {
        bPrivate = true;
        //console.log('=== its privachat ===');
    } else {
        bPrivate = false;
        //console.log('=== ' + msg.channel.name + " ===");
    }
    
    if(msg.content === '!m' && msg.author.username === 'raybarg' && bRunning == false) {
        bRunning = true;
        bot.bulkInterval = setInterval(function() { fetchBulkHistory(msg); }, 10000);

    } else if(msg.content === "!s" && msg.author.username === 'raybarg') {
        bot.getLastID(function(err, lastMsgID) {
            syncNewMessages(msg, lastMsgID);
        });

    } else if(msg.content === "!total" && (msg.channel.name === 'koodarit' || msg.channel.name === 'yleinen' || msg.channel instanceof Discord.DMChannel)) {
        bot.messageCount(function(err, total) {
            msg.channel.send('#yleinen kanavalla viestejä yhteensä: ' + total.toString());
        });

    } else if(msg.content === "!channels" && msg.author.username === 'raybarg') {
        testGetChannels();

    } else if(msg.content === '!ajarooli' && msg.author.username === 'raybarg') {
        giveLotsofPermissions();

    } else if(argv[0] === '!avatar') {
        var userName = msg.content.substring(8);
        userTest(msg, userName);

    } else if(argv[0] === '!stat') {
        userStat(msg);

    } else if(argv[0] === '!help') {
        helpSpam(msg);

    } else {
        //console.log(msg.author.username + ' sano että: ' + msg.content);

    }
});

/**
 * Hakee viestihistorian kanavalta
 * @param {*} msg Discordin viestiolio, tämän oli tarkoitus toimia kanavan tokenin antajana, mutta nyt hakuun on tehty kanavan tokenin magic number
 */
function fetchBulkHistory(msg) {
    const targetChannel = messisBot.channels.get(auth.yleinen);
    targetChannel.fetchMessages({ limit: bot.maxFetch, before: bot.lastID }).then(messages => {
        console.log(messages.size.toString());
        var msgArr = messages.array();
        for(var i = 0; i < msgArr.length; i++ ) {
            saveMessage(msgArr[i]);
        }
        if(messages.size < bot.maxFetch) {
            clearInterval(bot.bulkInterval);
        } else {
            bot.lastID = msgArr[msgArr.length-1].id;
        }
        
    }).catch(console.error);
}

/**
 * Hakee lastMsgID tokenin jälkeen tulleet uudet viestit
 * @param {*} msg Discordin viestiolio, tästä tiedetään minne kanavalle annetaan vastaus
 * @param {*} lastMsgID Tokeni jonka jälkeen tulleita viestejä haetaan
 */
function syncNewMessages(msg, lastMsgID) {
    const targetChannel = messisBot.channels.get(auth.yleinen);
    targetChannel.fetchMessages({ limit: bot.maxFetch, after: lastMsgID }).then(messages => {
        console.log(messages.size.toString() + " / " + bot.maxFetch.toString());
        var msgArr = messages.array();
        for(var i = 0; i < msgArr.length; i++ ) {
            saveMessage(msgArr[i]);
        }
    }).catch(console.error);
}

/**
 * Tallentaa yhden viestin tietokantaan
 * @param {*} message Viestin olio
 */
function saveMessage(message) {
    var con = new Connection(sqlConfig);
    con.on('connect', function(err) {
        if (err) {
            console.log(err);
        } else {
            var request = new Request('up_upd_discord_messages', function(err) {
                if (err) {
                    console.log(err);
                }
                con.close();
            });
            var d = message.createdAt;
            // Tehdään itse sopiva datestring muotoa YYYY-MM-DD hh:mm jota mssql syö natiivisti
            var dateString = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            request.addParameter('iServer_id', TYPES.NVarChar, message.guild.id.toString());
            request.addParameter('iChannel_id', TYPES.NVarChar, message.channel.id.toString());
            request.addParameter('iDiscord_message_id', TYPES.Int, 0);
            request.addParameter('iMessage_id', TYPES.NVarChar, message.id.toString());
            request.addParameter('dtMessage_date', TYPES.DateTime2, dateString);
            request.addParameter('strPerson_name', TYPES.NVarChar, message.author.username);
            // JSON.stringify() kaatuu circular poikkeukseen discord.message-objektin kanssa, util.inspect() tekee json muodon myös
            request.addParameter('strMessage_json', TYPES.NVarChar, Flatted.stringify(message));
            con.callProcedure(request);
        }
    });
}

/**
 * Testimetodi, haetaan botin tuntemat kanavat ja listataan ne konsoliin
 */
function testGetChannels() {
    messisBot.guilds.forEach((guild) => {
        console.log(" - " + guild.name);

        // kanavat
        guild.channels.forEach((channel) => {
            console.log(` -- ${channel.name} (${channel.type}) - ${channel.id}`);
        });
    });
}

function giveLotsofPermissions() {
    const target = messisBot.guilds.get(auth.messis);
    console.log(target);
    target.members.filter(m => !m.user.bot && !m.roles.has(auth.yleisrooli)).map(async member => await member.addRole(auth.yleisrooli).catch(console.error));
}

function userTest(msg, u) {
    console.log("Avatar käyttäjästä " + u + " : " + msg.author.username);
    const guild = messisBot.guilds.get(auth.messis);
    guild.members.filter(m => m.user.username === u).map(member => {
        msg.author.send(u + ' käyttäjän avatar url: ' + member.user.avatarURL);
    });
}

function userStat(msg) {
    console.log("Statistiikkaa käyttäjälle: " + msg.author.username);
    bot.getLastID(function(err, lastMsgID) {
        syncNewMessages(msg, lastMsgID);
        bot.messageCount(function(err, total) {
            bot.userMessageCount(msg.author.username, function(err, totalUser) {
                var reply = {embed: {
                    color: 3447003,
                    title: "Viestien statistiikkaa",
                    fields: [
                        { name: "#yleinen", value: total, inline: true},
                        { name: msg.author.username, value: totalUser, inline: true}
                    ]
                }};
                msg.channel.send(reply);
            });
        });
    });
}

function helpSpam(msg) {
    console.log("Helppilistaus käyttäjälle: " + msg.author.username);
    var reply = {embed: {
        color: 3447003,
        title: "Messis Bot Komentolistaus",
        fields: [
            { name: "!stat", value: "Oma käyttäjästatistiikkasi joka lähetetään privaattiviestinä.", inline: true},
            { name: "!avatar käyttäjänimi", value: "Hakee annetulle käyttäjänimelle avatar-linkin ja lähettää sen privaattiviestinä. Käyttäjänimi pitää olla discord-tilin oikea käyttäjänimi (ei näkyvä nimi) ja sen on oltava case-sensitiivinen.\nEsim. !avatar raybarg\nKomento ei kerro mitään jos käyttäjän nimellä ei löytynyt profiilia.", inline: true}
        ]
    }};
    msg.author.send(reply);
}
