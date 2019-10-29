/*jslint node: true */
"use strict";

const app = require("../../bot.js");

const properties = {
	command: "sana",
	aliases: [],
	description: "Haetaan lista montako kertaa sana toistuu eri kanavilla.",
	visible: true,
	arguments: ["<sana>"]
};

function run(msg, args) {
    // Datamäärä on tähän ratkaisumalliin liian suuri
    return 0;
    /*
    if (typeof args[1] !== 'undefined') {
        let strSearch = args[1];
        app.bot.wordCount(strSearch, function (err, rows) {
            let embed = new app.discord.RichEmbed();
            let chanList = '';
    
            if (err) {
                console.log(err);
            } else {
                if (rows) {
                    let total = 0;
                    let listed = 0;
                    embed.setTitle(app.common.getDisplayName(msg) + ' kysyi montako kertaa sana \"**' + strSearch + '**\" esiintyy kanavilla top 10:');
                    embed.setAuthor(app.client.user.username, app.client.user.displayAvatarURL);
                    rows.sort(app.common.compare);
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
                    if (!(msg.channel instanceof app.discord.DMChannel)) {
                        // Komennon poisto ei toimi privachatissa
                        msg.delete(2000);
                    }
                }
            }
        });
    }
    */
}
exports.properties = properties;
exports.run = run;
