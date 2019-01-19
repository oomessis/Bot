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
var sqlAuth = require('./auth/azureauth.json');
var BotCommon = require('./Libraries/BotLibrary/botcommon.js');

var bot = new BotCommon();

var sqlConfig = sqlAuth;

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

var messisBot = new Discord.Client();
messisBot.on('ready', () => {
    if (auth.dev === 0) {
        // Automaattinen viestien synkronointi
        bot.syncInterval = setInterval(function() { syncHistory(); }, 10000);
    }
});

messisBot.on('error', () => bot.log('errored'));
messisBot.login(auth.token);

// Raaka paketin käsittely, reagoi jos viestiin lisätty reaktio ja reaktion lisääjällä on oikeudet kunnossa
// Suoritetaan vain joso botti ei ole development versio
messisBot.on('raw', packet => {
    if (auth.dev === 0) {
        const guild = messisBot.guilds.get(auth.messis);
        if (!['MESSAGE_REACTION_ADD'].includes(packet.t)) return;
        const channel = messisBot.channels.get(packet.d.channel_id);
        const member = guild.members.get(packet.d.user_id);
        if (member.roles.has(auth.tuotantotiimi) || member.roles.has(auth.yllapito)) {
            channel.fetchMessage(packet.d.message_id).then(message => {
                const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
                const reaction = message.reactions.get(emoji);
                if (packet.t === 'MESSAGE_REACTION_ADD' && packet.d.emoji.name === 'juttu') {
                    bot.parroExists(message.author.id, message.id, function(err, parrotID) {
                        if(parrotID === -1) {
                            saveParrot(message);
                            logEvent(message.author.username + ' kirjoittama viesti ansaitsi papukaijamerkin ja tapahtuma arkistoitiin tietokantaan.\n' + message.url);
                            toimitusPapukaija(channel.name, message.author.username + ' / #' + message.channel.name + '\n' + message.url);
                        }
                    });
                }
            });
        }
    }
});

messisBot.on('message', msg => {
    var bPrivate = false;
    var argv = msg.content.split(' ');
    var cmd = getCommand(argv[0]);

    if(msg.channel instanceof Discord.DMChannel) {
        bPrivate = true;
    } else {
        bPrivate = false;
    }

    if (cmd.length > 0) {
        if(cmd === 'm' && msg.author.username === 'raybarg') {
            bot.bulkInterval = setInterval(function() { fetchBulkHistory(msg); }, 10000);
    
        } else if(cmd === "s" && msg.author.username === 'raybarg') {
            bot.syncInterval = setInterval(function() { syncHistory(); }, 10000);

        } else if(cmd === "koe" && msg.author.username === 'raybarg') {
            koe(msg.channel.name, 'testi');

        } else if(cmd === "channels" && msg.author.username === 'raybarg') {
            testGetChannels();
    
        } else if(cmd === 'ajarooli' && msg.author.username === 'raybarg') {
            giveLotsofPermissions();
    
        } else if(cmd === 'avatar') {
            var userName = msg.content.substring(8);
            userTest(msg, userName);
    
        } else if(cmd === 'stat') {
            userStat(msg);
    
        } else if(cmd === 'help') {
            helpSpam(msg);

        } else if(cmd === "sana") {
            var strSearch = msg.content.substring(6);
            if (!this.countingWords) {
                wordCount(msg, strSearch);
            }
            
        } else {
    
        }
    }

    if (!bPrivate && auth.dev === 0) {
        // Reaaliaikainen syncronointi
        if (msg.channel.id !== '532946068967784508' && msg.channel.id !== '524337438462836779' && msg.channel.id !== '502911862606659586') {
            // hoidetaan yleinen vielä intervalilla
            if (msg.channel.id !== '446419809668694019') {
                saveMessage(msg);
                bot.messagesSynced++;
            }
        }
    }
});

/**
 * Hakee viestihistorian kanavalta
 * @param {*} msg Discordin viestiolio, tämän oli tarkoitus toimia kanavan tokenin antajana, mutta nyt hakuun on tehty kanavan tokenin magic number
 */
function fetchBulkHistory(msg) {
    const targetChannel = messisBot.channels.get(auth.yleinen);
    targetChannel.fetchMessages({ limit: bot.maxFetch, before: bot.lastID }).then(messages => {
        bot.log(messages.size.toString());
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
 * Haetaan lista montako kertaa sana toistuu eri kanavilla
 * @param {*} msg 
 * @param {*} strSearch 
 */
function wordCount(msg, strSearch) {
    bot.wordCount(strSearch, function(err, rows) {
        const embed = new Discord.RichEmbed();
        var chanList = '';

        if (err) {
            console.log(err);
        } else {
            if (rows) {
                embed.setTitle(msg.author.username + ' kysyi montako kertaa sana \"**' + strSearch + '**\" esiintyy kanavilla:');
                embed.setAuthor(messisBot.user.username, messisBot.user.displayAvatarURL);
                rows.forEach(cols => {
                    chanList += '#' + cols[1].value + ' - **' + cols[0].value.toString() + '**\n';
                });
                embed.setDescription(chanList);
                msg.channel.send(embed).then(sentMsg => {
                    //sentMsg.delete(30000);
                });
                if(!(msg.channel instanceof Discord.DMChannel)) {
                    // Komennon poisto ei toimi privachatissa
                    msg.delete(2000);
                }
            } else {
                
            }
        }
    });
}

/**
 * Intervaalikutsu uusien viestien synccaukseen
 */
function syncHistory() {
    bot.getLastID(function(err, lastMsgID) {
        if (err) {
            console.log(err);
        } else {
            syncNewMessages(lastMsgID);
        }
    });
}

/**
 * Hakee lastMsgID tokenin jälkeen tulleet uudet viestit
 * @param {*} lastMsgID Tokeni jonka jälkeen tulleita viestejä haetaan
 */
function syncNewMessages(lastMsgID) {
    const targetChannel = messisBot.channels.get(auth.yleinen);
    targetChannel.fetchMessages({ limit: bot.maxFetch, after: lastMsgID }).then(messages => {
        bot.log(messages.size.toString() + " / " + bot.maxFetch.toString());
        if (messages.size > 0) {
            bot.messagesSynced += messages.size;
            var d = new Date();
            var thisHour = d.getHours();
            if (thisHour !== bot.lastHour) {
                logEvent("Syncronoitu viestejä kuluneen tunnin aikana: " + bot.messagesSynced.toString());

                bot.lastHour = thisHour;
                bot.messagesSynced = 0;
            }
        }
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
            request.addParameter('strMessage_text', TYPES.NVarChar, message.content.substring(0,1999));
            request.addParameter('iUser_id', TYPES.NVarChar, message.author.id.toString());
            con.callProcedure(request);
        }
    });
}

/**
 * Testimetodi, haetaan botin tuntemat kanavat ja listataan ne konsoliin
 */
function testGetChannels() {
    messisBot.guilds.forEach((guild) => {
        if (guild.id === auth.messis) {
            var spam = '';
            var count = 0;
            console.log(" - " + guild.name);

            // kanavat
            guild.channels.forEach((channel) => {
                if (channel.type !== 'category' && channel.type !== 'voice') {
                    spam += ` -- ${channel.name} (${channel.type}) - ${channel.id}\n`;
                    saveChannel(guild.id, channel);
                    count++;
                }
            });
            logEvent(count.toString() + ' kanavaa päivitetty tietokantaan.');
            console.log(spam);
        } else {
            console.log(guild);
        }
    });
}

/**
 * Annetaan kaikille guildin jäsenille yleisrooli
 */
function giveLotsofPermissions() {
    const target = messisBot.guilds.get(auth.messis);
    console.log(target);
    target.members.filter(m => !m.user.bot && !m.roles.has(auth.yleisrooli)).map(async member => await member.addRole(auth.yleisrooli).catch(console.error));
}

/**
 * Näyttää privaviestinä jäsenen avatar-urlin komennon antajalle
 * @param {*} msg 
 * @param {*} u 
 */
function userTest(msg, u) {
    logEvent("Avatar käyttäjästä " + u + " : " + msg.author.username);
    const guild = messisBot.guilds.get(auth.messis);
    guild.members.filter(m => m.user.username === u).map(member => {
        msg.author.send(u + ' käyttäjän avatar url: ' + member.user.avatarURL);
    });
}

/**
 * Statistiikkaa, kertoo montako viestiä on kanavalla ja montako kutsun antaneella jäsenellä
 * @param {*} msg 
 */
function userStat(msg) {
    logEvent("Statistiikkaa käyttäjälle: " + msg.author.username);
    bot.getLastID(function(err, lastMsgID) {
        syncNewMessages(msg, lastMsgID);
        bot.messageCount(function(err, total) {
            if (err) {

            }
            bot.userMessageCount(msg.author.username, function(err, totalUser) {
                var reply = {embed: {
                    color: 3447003,
                    title: "Viestien statistiikkaa",
                    fields: [
                        { name: "#yleinen", value: total, inline: true},
                        { name: msg.author.username, value: totalUser, inline: true}
                    ]
                }};
                msg.channel.send(reply).then(sentMsg => {
                    //sentMsg.delete(30000);
                });
                if(!(msg.channel instanceof Discord.DMChannel)) {
                    // Komennon poisto ei toimi privachatissa
                    msg.delete(2000);
                }
            });
        });
    });
}

/**
 * Lähetetään privaviestinä helppilistaus botin ymmärtämistä komennoista
 * @param {*} msg 
 */
function helpSpam(msg) {
    logEvent("Helppilistaus käyttäjälle: " + msg.author.username);
    var reply = {embed: {
        color: 3447003,
        title: "Messis Bot Komentolistaus",
        fields: [
            { name: "!stat", value: "Oma käyttäjästatistiikkasi joka lähetetään privaattiviestinä.", inline: true},
            { name: "!sana esimerkki", value: "Kanavakohtaine tilasto miten paljon sanaa 'esimerkkiä on käytetty.", inline: true},
            { name: "!avatar käyttäjänimi", value: "Hakee annetulle käyttäjänimelle avatar-linkin ja lähettää sen privaattiviestinä. Käyttäjänimi pitää olla discord-tilin oikea käyttäjänimi (ei näkyvä nimi) ja sen on oltava case-sensitiivinen.\nEsim. !avatar raybarg\nKomento ei kerro mitään jos käyttäjän nimellä ei löytynyt profiilia.", inline: true}
        ]
    }};
    msg.author.send(reply);
    msg.delete(2000);
}

/**
 * Prefiksin käsittely, parsitaan itse komento, palautetaan tyhjä jos prefix ei täsmää
 * @param {*} arg 
 */
function getCommand(arg) {
    if (arg.substring(0,1) === auth.prefix) {
        return arg.substring(1);
    }
    return '';
}

/**
 * Logitusviesti bottien omalle logituskanavalle
 * @param {*} msg 
 */
function logEvent(msg) {
    messisBot.channels.filter(ch => ch.id === auth.automaatio).map(async channel => await channel.send(msg));
}

/**
 * Tallentaa yhden kanavan tiedon tietokantaan
 * @param {*} guild Guild ID
 * @param {*} channel Kanavan olio
 */
function saveChannel(guild, channel) {
    var con = new Connection(sqlConfig);
    con.on('connect', function(err) {
        if (err) {
            console.log(err);
        } else {
            var request = new Request('up_upd_discord_channels', function(err) {
                if (err) {
                    console.log(err);
                }
                con.close();
            });
            request.addParameter('iDiscord_channel_id', TYPES.Int, 0);
            request.addParameter('iServer_id', TYPES.NVarChar, guild.toString());
            request.addParameter('iChannel_id', TYPES.NVarChar, channel.id.toString());
            request.addParameter('strChannel_name', TYPES.NVarChar, channel.name.toString());
            request.addParameter('bChannel_tracked', TYPES.NVarChar, 0);
            con.callProcedure(request);
        }
    });
}

/**
 * Tallentaa yhden papukaijan tietokantaan
 * @param {*} message Viestin olio
 */
function saveParrot(message) {
    var con = new Connection(sqlConfig);
    con.on('connect', function(err) {
        if (err) {
            console.log(err);
        } else {
            var request = new Request('up_upd_parrot', function(err) {
                if (err) {
                    console.log(err);
                }
                con.close();
            });
            // Tehdään itse sopiva datestring muotoa YYYY-MM-DD hh:mm jota mssql syö natiivisti
            var d = message.createdAt;
            var dateString = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            request.addParameter('iParrot_id', TYPES.Int, 0);
            request.addParameter('iUser_id', TYPES.NVarChar, message.author.id);
            request.addParameter('iMessage_id', TYPES.NVarChar, message.id.toString());
            request.addParameter('dtMessage_date', TYPES.DateTime2, dateString);
            request.addParameter('strPerson_name', TYPES.NVarChar, message.author.username);
            request.addParameter('strMessage_text', TYPES.NVarChar, message.content.substring(0,1999));
            request.addParameter('strMessage_url', TYPES.NVarChar, message.url.substring(0,199));
            con.callProcedure(request);
        }
    });
}

/**
 * Badgeviesti toimitukselle
 * @param {*} msg 
 */
function toimitusPapukaija(channelName, msg) {
    const ch = messisBot.channels.find(ch => ch.name === channelName && ch.guild.id === auth.toimitus);
    if (ch === null) {
        messisBot.channels.filter(ch => ch.id === auth.toimituspapukaija).map(async channel => await channel.send(msg));
    } else {
        ch.send(msg);
    }
}

