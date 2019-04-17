/*jslint node: true */
"use strict";

const app = require("./../bot.js");

const properties = {
	command: "help",
	description: "Help list.",
	visible: true,
	arguments: []
};

function run(msg) {
    app.bot.logEvent("Helppilistaus käyttäjälle: " + msg.author.username);
    msg.author.send({
        embed: {
            color: 3447003,
            title: "Messis Bot Komentolistaus",
            fields: [
                {
                    name: "!stat",
                    value: "Oma käyttäjästatistiikkasi joka lähetetään privaattiviestinä.",
                    inline: false
                },
                {
                    name: "!sana <esimerkki>",
                    value: "Kanavakohtaine tilasto miten paljon sanaa 'esimerkki' on käytetty.",
                    inline: false
                },
                {name: "!badgescores", value: "Lista ansaituista badgeistä per käyttäjä.", inline: false},
                {
                    name: "!badgelist <nimi>",
                    value: "<nimi> käyttäjän badget, pvm, linkki ja teksti.",
                    inline: false
                },
                {
                    name: "!avatar <käyttäjänimi>",
                    value: "Hakee annetulle käyttäjänimelle avatar-linkin ja lähettää sen privaattiviestinä. Käyttäjänimi pitää olla discord-tilin oikea käyttäjänimi (ei näkyvä nimi) ja sen on oltava case-sensitiivinen.\nEsim. !avatar raybarg\nKomento ei kerro mitään jos käyttäjän nimellä ei löytynyt profiilia.",
                    inline: false
                }
            ]
        }
    });
    if (!(msg.channel instanceof app.discord.DMChannel)) msg.delete(2000);
}
exports.properties = properties;
exports.run = run;

