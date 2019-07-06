/*jslint node: true */
"use strict";

const app = require("./../bot.js");

const properties = {
	command: "badget",
	description: "Badgekomennot.",
	visible: true,
	arguments: ["<komento>"]
};

function run(msg, args) {
    if (typeof args[1] !== 'undefined') {
        if (args[1] === 'ohje') {
            let embed = new app.discord.RichEmbed();
            let badgeGuide = '';
            embed.setTitle('Badge ohje:');
            embed.setAuthor(app.client.user.username, app.client.user.displayAvatarURL);
            badgeGuide += '**juttu** - Puheenaihe-badge joka annetaan kun viesti on hyvä puheenaihe ja aloitti siitä keskustelun. Ilmoitus kanaville: yleinen, puheenaiheet ja tuotantotiimin toimitukseen. \n';
            badgeGuide += '**idea** - Idea-badge joka annetaan hyvästä ideasta. Ilmoitus tuotantotiimin toimitukseen. \n';
            badgeGuide += '**lainaus** - Lainaus-badge joka annetaan hyvästä lainauksen arvoisesta viestistä. Ilmoitus tuotantotiimin toimitukseen. \n';
            badgeGuide += '**kultainensydan** - Kultainen sydän-badge joka annetaan kun viesti sisältää lämminsydämisen vastauksen toiselle yhteisöläiselle. Ilmoitus tuotantotiimin toimitukseen. \n';
            badgeGuide += '**toimitus** - Agenda-badge josta ilmoitus toimitustiimin agenda-feediin. \n';
            badgeGuide += '**ohjelma** - Agenda-badge josta ilmoitus ohjelmatiimin agenda-feediin. \n';
            badgeGuide += '**staffi** - Agenda-badge josta ilmoitus staffin agenda-feediin. \n';
            badgeGuide += '**tietohallinto** - Agenda-badge josta ilmoitus tietohallintotiimin agenda-feediin. \n';
            embed.setDescription(badgeGuide);
            msg.channel.send(embed).then(sentMsg => {
            });    
        }
    }
}
exports.properties = properties;
exports.run = run;
