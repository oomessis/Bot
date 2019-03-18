const auth = require('../auth/auth');

exports.run = (client, message, args, level) => {
    client.syncInterval = setInterval(function() { syncHistory(); }, 10000);

    /**
     * Intervaalikutsu uusien viestien synccaukseen
     */
    function syncHistory() {
        client.bot.getLastID(function(err, lastMsgID) {
            if (err) {
                client.logger.error(err);
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
        const targetChannel = client.channels.get(auth.yleinen);
        targetChannel.fetchMessages({ limit: client.maxFetch, after: lastMsgID }).then(messages => {
            if (messages.size > 0) {
                client.logger.log(messages.size.toString() + " / " + client.bot.maxFetch.toString());
            }
            if (messages.size > 0) {
                client.bot.messagesSynced += messages.size;
                let d = new Date();
                let thisHour = d.getHours();
                if (thisHour !== bot.lastHour) {
                    if (client.bot.messagesSynced > 0) {
                        client.bot.logEvent("Syncronoitu viestejä: " + client.bot.messagesSynced.toString());
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
    permLevel: "Raybarg"
};

exports.help = {
    name: "s",
    category: "Sekalainen",
    description: "Ei kuvausta",
    usage: "s"
};