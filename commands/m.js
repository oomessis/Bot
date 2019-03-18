const auth = require('../auth/auth.json');
const sqlAuth = require('../auth/azureauth.json');
const Connection = require("tedious").Connection;
const TYPES = require('tedious').TYPES;
const request = require('request');
const Request = require('tedious').Request;

exports.run = (client, message, args, level) => {
    const sqlConfig = sqlAuth;

    client.bot.bulkInterval = setInterval(function () {fetchBulkHistory(message);}, 20000);

    /**
     * Hakee viestihistorian kanavalta
     * @param {*} msg Discordin viestiolio, tämän oli tarkoitus toimia kanavan tokenin antajana, mutta nyt hakuun on tehty kanavan tokenin magic number
     */
    function fetchBulkHistory(msg) {
        const targetChannel = client.channels.get(auth.yleinen);
        targetChannel.fetchMessages({ limit: client.bot.maxFetch, before: client.bot.lastID }).then(messages => {
            client.bot.log(messages.size.toString());
            let msgArr = messages.array();
            for(let i = 0; i < msgArr.length; i++ ) {
                saveMessage(msgArr[i]);
            }
            if(messages.size < client.bot.maxFetch) {
                clearInterval(client.bot.bulkInterval);
            } else {
                client.bot.lastID = msgArr[msgArr.length-1].id;
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
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "Raybarg"
};

exports.help = {
    name: "m",
    category: "Sekalainen",
    description: "Ei kuvausta",
    usage: "m"
};