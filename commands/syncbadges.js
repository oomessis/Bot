/*jslint node: true */
"use strict";
let app = require("./../bot.js");
let badges = require("./../Libraries/DatabaseLibrary/Badges.js");

const properties = {
	command: "syncbadges",
	description: "Synkronisoidaan badgeviestien sisällöt",
	visible: true,
	arguments: []
};

function run(message) {
    let guild = app.client.guilds.get(app.snowflakes.messis);
    let member = guild.members.get(message.author.id);
    if (message.author.id === app.snowflakes.admin || member.roles.has(app.snowflakes.tuotantotiimi) || member.roles.has(app.snowflakes.yllapito)) {
        badges.getAllBadgeMessageIDs(function(err, ids) {
            let iLoop = 1;
            ids.forEach(messageid => {
                setTimeout(function() {
                    let channel = app.client.channels.get(messageid[0].value);
                    channel.fetchMessage(messageid[1].value).then(message => {
                        let badge = new badges();
                        badge._save(messageid[2].value, message);
                    });
                }, 1000 * (iLoop+1));
                iLoop++;
            });
    
        });
    }
}
exports.properties = properties;
exports.run = run;

