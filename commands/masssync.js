/*jslint node: true */
"use strict";

const discordMessage = require('./../Libraries/DatabaseLibrary/DiscordMessage.js');
const app = require("./../bot.js");

const properties = {
	command: "masssync",
	description: "Massana tilastoidaan viestit.",
	visible: true,
	arguments: []
};

let bulkIndex;
let bulkInterval;
let lastID = '563811333481562122';

/**
 * Kanavien historioiden haku
 * @param {*} message 
 */
function run(message) {
    if (message.author.username === 'raybarg') {
        console.log(app.client.user.id);
        app.bot.getChannels(function (err, channels) {
            if (err) {
                console.log(err);
            } else {
                if (channels) {
                    channels.forEach(cols => {
                        app.bot.channels.push(cols[2].value);
                    });
                    console.log('Kanavia ' + app.bot.channels.length);
                    bulkIndex = 0;
                    bulkInterval = setInterval(function () {
                        fetchBulkHistoryAllChannels();
                    }, 20000);
                }
            }
        });
    }
}

/**
 * Hakee viestihistorian kanavilta
 */
function fetchBulkHistoryAllChannels() {
	let targetChannel = app.client.channels.get(app.bot.channels[bulkIndex]);
	if (targetChannel) {
		let can_read_history = targetChannel.permissionsFor(app.client.user.id).has("READ_MESSAGE_HISTORY", false);
		let can_view_channel = targetChannel.permissionsFor(app.client.user.id).has("VIEW_CHANNEL", false);
		if (can_read_history && can_view_channel) {
			targetChannel.fetchMessages({limit: app.bot.maxFetch, before: lastID}).then(messages => {
				app.bot.log(app.bot.channels[bulkIndex] + ' -> ' + messages.size.toString());
				let msgArr = messages.array();
				let iLoop = 1;
				messages.forEach(msg => {
					setTimeout(function() { discordMessage.save(msg); }, 100 * (iLoop+1));
					iLoop++;
				});
				if (messages.size < app.bot.maxFetch) {
					bulkIndex++;
					lastID = '563811333481562122';
				} else {
					lastID = msgArr[msgArr.length - 1].id;
				}

			}).catch(console.error);
		} else {
			app.bot.log(app.bot.channels[bulkIndex] + ' skipattu koska ei oikeuksia.');
			bulkIndex++;
		}
	} else {
		app.bot.log(app.bot.channels[bulkIndex] + ' skipattu koska kanavan haku ei palauttanut mitään.');
		bulkIndex++;
	}
	if (bulkIndex >= app.bot.channels.length) {
		clearInterval(bulkInterval);
	}
}

exports.properties = properties;
exports.run = run;

