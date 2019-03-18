const Discord = require('discord.js');

exports.run = (client, message, args, level) => {
    let strSearch = message.content.substring(7);
    if (!this.countingWords) {
        wordCount(message, strSearch);
    }

    /**
     * Haetaan lista montako kertaa sana toistuu eri kanavilla
     * @param {*} msg
     * @param {*} strSearch
     */
    function wordCount(msg, strSearch) {
        client.bot.wordCount(strSearch, function(err, rows) {
            const embed = new Discord.RichEmbed();
            let chanList = '';
            if (err) {
                console.log(err);
            } else {
                if (rows) {
                    let total = 0;
                    let listed = 0;
                    embed.setTitle(getDisplayName(msg) + ' kysyi montako kertaa sana \"**' + strSearch + '**\" esiintyy kanavilla top 10:');
                    embed.setAuthor(client.user.username, client.user.displayAvatarURL);
                    rows.sort(client.bot.compare);
                    rows.forEach(cols => {
                        if (cols[0].value > 0) {
                            listed++;
                            if (listed <= 10) {
                                chanList += listed.toString() + '. #' + cols[1].value + ' - **' + cols[0].value.toString() + '**\n';
                            }
                            total += cols[0].value;
                        }
                    });
                    chanList += '---\n';
                    chanList += 'Yhteensä kaikilta kanavilta: **' + total.toString() + '**\n';
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
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "Käyttäjä"
};

exports.help = {
    name: "sana",
    category: "Statiikka",
    description: "Kanavakohtaine tilasto miten paljon sanaa 'esimerkki' on käytetty.",
    usage: "sana <esimerkki>"
};