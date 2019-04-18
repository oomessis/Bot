/*jslint node: true */
"use strict";

const app = require("./../bot.js");

const properties = {
	command: "puheenaihelista",
	description: "Näyttää badgejen ansaintalista.",
	visible: true,
	arguments: []
};

function run(message) {
	app.bot.getPABadgeScoreList(function (err, rows) {
		if (err) {
			console.log(err);
		} else {
			if (rows) {
				let listedPaging = 0;
				let scoreList = '```Montako kertaa puheenaihebadgeja ansaittu:\n';
				rows.forEach(cols => {
					if (cols[0].value > 0) {
						listedPaging++;
						scoreList += cols[0].value.toString() + ' \t\t' + cols[1].value + '\n';
						if (listedPaging >= 20) {
							scoreList += '```';
							message.channel.send(scoreList);
							listedPaging = 0;
							scoreList = '```';
						}
					}
				});
				scoreList += '```';
				message.channel.send(scoreList);
				if (!(message.channel instanceof app.discord.DMChannel)) {
					// Komennon poisto ei toimi privachatissa
					message.delete(2000);
				}
			}
		}
	});
}
exports.properties = properties;
exports.run = run;
