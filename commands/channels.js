/*jslint node: true */
"use strict";

const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const app = require("./../bot.js");

const properties = {
	command: "channels",
	description: "Tallennetaan kanavat.",
	visible: true,
	arguments: []
};

/**
 * Tallennetaan kanavat omaan tauluun
 * @param {*} message 
 */
function run(message) {
    if (message.author.username === 'raybarg') {
        app.client.guilds.forEach((guild) => {
            if (guild.id === app.snowflakes.messis) {
                let spam = '';
                let count = 0;
                console.log(" - " + guild.name);
    
                // kanavat
                guild.channels.forEach(function(channel) {
                    if (channel.type !== 'category' && channel.type !== 'voice') {
                        spam += ` -- ${channel.name} (${channel.type}) - ${channel.id}\n`;
                        setTimeout(function() { saveChannel(guild.id, channel); }, 200 * count);
                        count++;
                    }
                });
                app.bot.logEvent(count.toString() + ' kanavaa päivitetty tietokantaan.');
                console.log(spam);
            } else {
                console.log(guild);
            }
        });
        }
}

/**
 * Tallentaa yhden kanavan tiedon tietokantaan
 * @param {*} guild Guild ID
 * @param {*} channel Kanavan olio
 */
function saveChannel(guild, channel) {
	let con = new Connection(app.sqlConfig);
	con.on('error', function(err) {
		console.log('Connection error: \n' + err);
	});
	con.on('connect', function (err) {
		if (err) {
			console.log(err);
		} else {
			let request = new Request('up_upd_discord_channels', function (err) {
				if (err) {
					console.log(err);
				}
				con.close();
			});
			request.addParameter('iDiscord_channel_id', TYPES.Int, 0);
			request.addParameter('iServer_id', TYPES.NVarChar, guild.toString());
			request.addParameter('iChannel_id', TYPES.NVarChar, channel.id.toString());
			request.addParameter('strChannel_name', TYPES.NVarChar, channel.name.toString());
			request.addParameter('bChannel_tracked', TYPES.NVarChar, 0);
			con.callProcedure(request);
		}
	});
}
exports.properties = properties;
exports.run = run;
