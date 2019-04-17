/*jslint node: true */
"use strict";

const app = require("./../bot.js");

const properties = {
	command: "stat",
	description: "Käyttäjän viestistatistiikka.",
	visible: true,
	arguments: []
};

/**
 * Statistiikkaa, kertoo montako viestiä on kanavalla ja montako kutsun antaneella jäsenellä
 * @param {*} message 
 */
function run(msg) {
	app.bot.logEvent("Statistiikkaa käyttäjälle: " + app.common.getDisplayName(msg));
    app.bot.messageCount(function (err, totalAllChannels) {
        if (err) {
            console.log(err);
        } else {
            app.bot.userMessageCount(msg.author.id, function (err, totalUserList) {
                if (err) {
                    console.log(err);
                } else {
                    if (totalUserList) {
                        let embed = new app.discord.RichEmbed();
                        let total = 0;
                        let listed = 0;
                        let chanList = '';
                        let percent = 0;
                        embed.setTitle('Käyttäjän `' + app.common.getDisplayName(msg) + '` viestien statistiikkaa top 10:');
                        embed.setAuthor(app.client.user.username, app.client.user.displayAvatarURL);
                        totalUserList.sort(app.common.compare);
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
                        msg.channel.send(embed).then(sentMsg => {
                            //sentMsg.delete(30000);
                        });
                        if (!(msg.channel instanceof app.discord.DMChannel)) {
                            // Komennon poisto ei toimi privachatissa
                            msg.delete(2000);
                        }
                    }
                }
            });
        }
    });
}
exports.properties = properties;
exports.run = run;
