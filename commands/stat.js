const Discord = require('discord.js');
const auth = require('../auth/auth.json');
const sqlAuth = require('../auth/azureauth.json');
const Connection = require("tedious").Connection;

exports.run = (client, message, args, level) => {
    const sqlConfig = sqlAuth;

    userStat(message);
    /**
     * Statistiikkaa, kertoo montako viestiä on kanavalla ja montako kutsun antaneella jäsenellä
     * @param {*} message
     */
    function userStat(message) {
        logEvent("Statistiikkaa käyttäjälle: " + getDisplayName(message));
        client.bot.getLastID(function(err, lastMsgID) {
            syncNewMessages(lastMsgID);
            client.bot.messageCount(function(err, totalAllChannels) {
                if (err) {
                    console.log(err);
                } else {
                    client.bot.userMessageCount(message.author.id, function(err, totalUserList) {
                        if (err) {
                           console.log(err);
                        } else {
                            if (totalUserList) {
                                const embed = new Discord.RichEmbed();
                                let total = 0;
                                let listed = 0;
                                let chanList = '';
                                let percent = 0;
                                embed.setTitle('Käyttäjän `' + getDisplayName(message) + '` viestien statistiikkaa top 10:');
                                embed.setAuthor(client.user.username, client.user.displayAvatarURL);
                                totalUserList.sort(client.bot.compare);
                                totalUserList.forEach(cols => {
                                    if (cols[0].value > 0) {
                                        listed++;
                                        if (listed <= 10) {
                                            chanList += listed.toString() + '. #' + cols[1].value + ' - **' + cols[0].value.toString() + '**\n';
                                        }
                                        total += cols[0].value;
                                    }
                                });
                                percent = (total / totalAllChannels) * 100;
                                chanList += '---\n';
                                chanList += 'Yhteensä kaikilta kanavilta: **' + total.toString() + '** / **' + totalAllChannels.toString() + '**. Olet kirjoittanut ' + parseFloat(percent).toFixed(1) + '% Messiksen viesteistä.';
                                embed.setDescription(chanList);
                                message.channel.send(embed).then(sentMsg => {
                                    //sentMsg.delete(30000);
                                });
                                if(!(message.channel instanceof Discord.DMChannel)) {
                                    // Komennon poisto ei toimi privachatissa
                                    message.delete(2000);
                                }
                            }
                        }
                    });
                }
            });
        });
    }

    /**
     * Tulkitaan msg-objektista userin nimi/nicki
     * @param {*} msg
     */
    function getDisplayName(msg) {
        if(msg.channel instanceof Discord.DMChannel) {
            return msg.author.username;
        }
        else {
            return msg.member.displayName;
        }
    }

    /**
     * Hakee lastMsgID tokenin jälkeen tulleet uudet viestit
     * @param {*} lastMsgID Tokeni jonka jälkeen tulleita viestejä haetaan
     */
    function syncNewMessages(lastMsgID) {
        const targetChannel = client.channels.get(auth.yleinen);
        targetChannel.fetchMessages({ limit: client.maxFetch, after: lastMsgID }).then(messages => {
            if (messages.size > 0) {
                logEvent(messages.size.toString() + " / " + client.bot.maxFetch.toString());
            }
            if (messages.size > 0) {
                client.bot.messagesSynced += messages.size;
                let d = new Date();
                let thisHour = d.getHours();
                if (thisHour !== client.bot.lastHour) {
                    if (client.bot.messagesSynced > 0) {
                        logEvent("Syncronoitu viestejä: " + client.bot.messagesSynced.toString());
                    }

                    client.bot.lastHour = thisHour;
                    client.bot.messagesSynced = 0;
                }
            }
            let msgArr = messages.array();
            for(let i = 0; i < msgArr.length; i++ ) {
                saveMessage(msgArr[i]);
            }
        }).catch(console.error);
    }

    /**
     * Logitusviesti bottien omalle logituskanavalle
     * @param {*} message
     */
    function logEvent(message) {
        client.channels.filter(ch => ch.id === auth.automaatio).map(async channel => await channel.send(message));
    }

    /**
     * Tallentaa yhden viestin tietokantaan
     * @param {*} message Viestin olio
     */
    function saveMessage(message) {
        const con = new Connection(sqlConfig);

        // Ei tallenneta messis botin omia viestejä
        if (message.author.id === auth.messisbot) {
            return;
        }

        // Ei tallenneta bottien omia viestejä.
        if(message.author.bot === Boolean(true)) {
            return;
        }

        if (!message.channel.id) {
            console.log("Channel id is null!");
            return;
        }

        con.on('connect', function(err) {
            if (err) {
                console.log(err);
            } else {
                const request = new Request('up_upd_discord_messages', function(err) {
                    if (err) {
                        client.logger.error(err);
                    }
                    con.close();
                });
                let d = message.createdAt;
                // Tehdään itse sopiva datestring muotoa YYYY-MM-DD hh:mm jota mssql syö natiivisti
                let dateString = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
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
     * Logitusviesti bottien omalle logituskanavalle
     * @param {*} message
     */
    function logEvent(message) {
        client.channels.filter(ch => ch.id === auth.automaatio).map(async channel => await channel.send(message));
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: ['stats'],
    permLevel: "Käyttäjä"
};

exports.help = {
    name: "stat",
    category: "Statiikka",
    description: "Oma käyttäjästatistiikkasi",
    usage: "stat"
};