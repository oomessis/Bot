/*jslint node: true */
"use strict";

const app = require("./../bot.js");
let messisUser = require("./../Libraries/DatabaseLibrary/MessisUser.js");

const properties = {
	command: "syncusers",
	description: "Virkistetään henkilörekisteri.",
	visible: true,
	arguments: []
};


/**
 * Kanavien historioiden haku
 * @param {*} message 
 */
function run(message) {
    if (message.author.id === app.snowflakes.admin) {
        let guild = app.client.guilds.get(app.snowflakes.messis);     
        let iLoop = 1;
        guild.members.forEach(member => {
            setTimeout(function() {
                messisUser.save(member.id, member.displayName, member.joinedAt, function(err, iState) {
                    var d = new Date();
                    console.log(d.toString());
                });
            }, 1000 * (iLoop+1));
            iLoop++;
        });
    }
}


exports.properties = properties;
exports.run = run;

