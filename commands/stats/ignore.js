/*jslint node: true */
"use strict";

let app = require("../../bot.js");
let ignoredChannels = require("../../Libraries/DatabaseLibrary/IgnoredChannels.js");

const properties = {
	command: "ignore",
    aliases: [],
	description: "Tilastoinnista suodatettavien kanavien komento.",
	visible: true,
	arguments: ["<kanavaID>"]
};

function run(message, args) {
    if (typeof args[1] !== 'undefined') {
        let guild = app.client.guilds.get(app.snowflakes.messis);
        let member = guild.members.get(message.author.id);
        if (message.author.id === app.snowflakes.admin || member.roles.has(app.snowflakes.tuotantotiimi) || member.roles.has(app.snowflakes.yllapito)) {

            if (args[1] === 'lista') {
                ignoredChannels.getIgnoredChannels(function(err, channels) {
                    if (err) {
                        console.log(err);
                    } else {
                        let embed = new app.discord.RichEmbed();
                        let channelList = '';
    
                        embed.setTitle('Tilastoissa ei huomioida kanavia:');
                        embed.setAuthor(app.client.user.username, app.client.user.displayAvatarURL);
    
                        channels.forEach(element => {
                            channelList += `${element[0].value} - **${element[1].value}** \n`;
                        });
                        embed.setDescription(channelList);
                        message.channel.send(embed).then(sentMsg => {
                        });    
                    }
                });
            } else {
                ignoredChannels.save(args[1], function(err, status) {
                    if (status === 1) {
                        message.channel.send(`**${args[1]}** tallennus suoritettu.`);
                    }
                });
            }

        } 
    }
}
exports.properties = properties;
exports.run = run;
