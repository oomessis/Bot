const auth = require('../auth/auth.json');
const sqlAuth = require('../auth/azureauth.json');
const Connection = require("tedious").Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

exports.run = async (client, message, args, level) => {
    const sqlConfig = sqlAuth;

    client.bot.getChannels(function (err, channels) {
        if (err){
            client.logger.error(err);
        } else {
            if (channels) {
                channels.forEach(cols => {
                    client.bot.channels.push(cols[2].value);
                });
                client.logger.log('Kanavia ' + client.bot.channels.length);
                client.bot.bulkIndex = 0;
                client.bot.bulkInterval = setInterval(function() { fetchBulkHistoryAllChannels(); }, 20000);
            }
        }

    });

    /**
     * Hakee viestihistorian kanavilta
     */
    function fetchBulkHistoryAllChannels() {
        if (client.bot.channels[client.bot.bulkIndex] !== auth.yleinen) {
            const targetChannel = client.channels.get(client.bot.channels[client.bot.bulkIndex]);
            if (targetChannel) {
                const can_read_history = targetChannel.permissionsFor(client.user.id).has("READ_MESSAGE_HISTORY", false);
                const can_view_channel = targetChannel.permissionsFor(client.user.id).has("VIEW_CHANNEL", false);
                if (can_read_history && can_view_channel) {
                    targetChannel.fetchMessages({ limit: client.bot.maxFetch, before: client.bot.lastID }).then(messages => {
                        client.logger.log(client.bot.channels[client.bot.bulkIndex] + ' -> ' + messages.size.toString());
                        const msgArr = messages.array();
                        for(let i = 0; i < msgArr.length; i++ ) {
                            saveMessage(msgArr[i]);
                        }
                        if(messages.size < client.bot.maxFetch) {
                            client.bot.bulkIndex++;
                            client.bot.lastID = '';
                        } else {
                            client.bot.lastID = msgArr[msgArr.length-1].id;
                        }

                    }).catch(console.error);
                } else {
                    client.logger.log(client.bot.channels[client.bot.bulkIndex] + ' skipattu koska ei oikeuksia.');
                    client.bot.bulkIndex++;
                }
            } else {
                client.logger.log(client.bot.channels[client.bot.bulkIndex] + ' skipattu koska kanavan haku ei palauttanut mitään.');
                client.bot.bulkIndex++;
            }
            if (client.bot.bulkIndex >= client.bot.channels.length) {
                clearInterval(client.bot.bulkInterval);
            }
        }
    }

    /**
     * Tallentaa yhden kanavan tiedon tietokantaan
     * @param {*} guild Guild ID
     * @param {*} channel Kanavan olio
     */
    function saveChannel(guild, channel) {
        const con = new Connection(sqlConfig);
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
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "Bot Owner"
};

exports.help = {
    name: "masssync",
    category: "Sekalainen",
    usage: "masssync"
};
