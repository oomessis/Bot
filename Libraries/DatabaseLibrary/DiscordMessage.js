const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;
const sqlConfig = require('../../auth/azureauth.json');
const snowflakes = require('../../auth/snowflakes.json');
const moment = require('moment');


class DiscordMessage {
	/**
	 * Tallentaa yhden viestin tietokantaan
	 * @param {*} message Viestin olio
	 */
	static save(message) {
		let con = new Connection(sqlConfig);

		// Ei tallenneta bottien omia viestejä.
		if (message.author.bot === Boolean(true)) {
			return;
		}
		if (!message.channel.id) {
			console.log("Channel id is null!");
			return;
		}
		con.on('error', function(err) {
			console.log('Connection error: \n' + err);
		});
		con.on('connect', function (err) {
			if (err) {
				console.log(err);
			} else {
				let cmd = new Request('up_upd_discord_messages', function (err) {
					if (err) {
						console.log(err);
					}
					con.close();
				});
				cmd.addParameter('iServer_id', TYPES.NVarChar, message.guild.id.toString());
				cmd.addParameter('iChannel_id', TYPES.NVarChar, message.channel.id.toString());
				cmd.addParameter('iDiscord_message_id', TYPES.Int, 0);
				cmd.addParameter('iMessage_id', TYPES.NVarChar, message.id.toString());
				cmd.addParameter('dtMessage_date', TYPES.DateTime2, moment.utc(message.createdAt).tz("Europe/Helsinki").format('YYYY-M-D H:m:s'));
				cmd.addParameter('strPerson_name', TYPES.NVarChar, message.author.username);
				cmd.addParameter('strMessage_text', TYPES.NVarChar, "");
				cmd.addParameter('iUser_id', TYPES.NVarChar, message.author.id.toString());
				con.callProcedure(cmd);
			}
		});
	}
}
module.exports = DiscordMessage;
