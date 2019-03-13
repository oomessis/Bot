const auth = require('../auth/auth');
const Connection = require("tedious").Connection;

module.exports  = async (client, raw) => {
    if (auth.dev === 0) {
        if (['MESSAGE_REACTION_ADD'].includes(raw.t)) {
            const guild = client.guilds.get(auth.messis);
            const channel = client.channels.get(raw.d.channel_id);
            const member = guild.members.get(raw.d.user_id);
            if (member.roles.has(auth.tuotantotiimi) || member.roles.has(auth.yllapito)) {
                channel.fetchMessage(raw.d.message_id).then(message => {
                    const emoji = raw.d.emoji.id ? `${raw.d.emoji.name}:${raw.d.emoji.id}` : raw.d.emoji.name;
                    const reaction = message.reactions.get(emoji);
                    if (packet.t === 'MESSAGE_REACTION_ADD' && raw.d.emoji.name === 'juttu') {
                        client.bot.parroExists(message.author.id, message.id, function (err, parrotID) {
                            if (err) {
                                client.logger.error(err);
                            } else {
                                if (parrotID === -1) {
                                    saveParrot(message, channel.id);
                                    toimitusPapukaija(channel.name, message);
                                }
                            }
                        });
                    }
                });
            }
        }
        if (['GUILD_MEMBER_ADD'].includes(raw.t)) {
            // uusi käyttäjä
            client.bot.logEvent('Uusi käyttäjä (' + raw.d.user.id + ') ' + raw.d.user.username + ' liittyi serverille.');
        }
        if (['GUILD_MEMBER_REMOVE'].includes(raw.t)) {
            // uusi käyttäjä
            client.bot.logEvent('Käyttäjä (' + raw.d.user.id + ') ' + raw.d.user.username + ' poistui serveriltä.');
        }
    }else {
        if (['PRESENCE_UPDATE'].includes(raw.t)) {
            if (raw.d.guild_id === auth.messis) {
                console.log(raw);
            }
        }
    }

    /**
     * Tallentaa yhden papukaijan tietokantaan
     * @param {*} message Viestin olio
     */
    function saveParrot(message, channelID) {
        var con = new Connection(sqlConfig);
        con.on('connect', function(err) {
            if (err) {
                client.logger.error(err);
            } else {
                var request = new Request('up_upd_parrot', function(err) {
                    if (err) {
                        client.logger.error(err);
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
    function toimitusPapukaija(channelName, message) {
        const announcement1 = 'Käyttäjän ' + message.author + ' kirjoittama viesti kanavalla `#' + message.channel.name + '` ansaitsi puheenaihe-badgen.\n<' + message.url + '>';
        const announcement2 = 'Käyttäjän `' + message.author.username + '` kirjoittama viesti kanavalla `#' + message.channel.name + '` ansaitsi puheenaihe-badgen.\n<' + message.url + '>';
        const content = message.content.split('`').join('');

        client.bot.logEvent(announcement2);

        const ch = client.channels.find(ch => ch.name === channelName && ch.guild.id === auth.toimitus);
        if (ch === null) {
            client.channels.filter(ch => ch.id === auth.toimituspapukaija).map(async channel => await channel.send(announcement2));
        } else {
            ch.send(announcement2);
        }
        const chYleinen = client.channels.find(ch => ch.id = auth.yleinen);
        if (chYleinen) {
            chYleinen.send(announcement1 + '\n```' + content + '```');
        }

        /// Puheenaiheet kanavalle
        //client.channels.filter(chPh => chPh.id === auth.puheenaiheet).map(async channelPh => await channelPh.send(announcement2));
    }
};