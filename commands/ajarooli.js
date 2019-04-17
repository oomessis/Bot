/*jslint node: true */
"use strict";

const app = require("./../bot.js");

const properties = {
	command: "ajarooli",
	description: "Ajetaan rooli kaikille käyttäjille.",
	visible: true,
	arguments: []
};

/**
 * Annetaan kaikille guildin jäsenille yleisrooli
 * @param {*} message 
 */
function run(message) {
    if (message.author.username === 'raybarg') {
        let target = app.client.guilds.get(app.snowflakes.messis);
        console.log(target);
        target.members.filter(m => !m.user.bot && !m.roles.has(app.snowflakes.yleisrooli)).map(async member => await member.addRole(app.snowflakes.yleisrooli).catch(console.error));
    }
}
exports.properties = properties;
exports.run = run;
