const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const sqlConfig = require('../../auth/azureauth.json');
const Snowflakes = require('../../auth/snowflakes.json');

/**
 * Tallentaa yhden viestin tietokantaan
 * @param {*} message Viestin olio
 */
exports.saveMessage = (message) => {
	let con = new Connection(sqlConfig);

	// Ei tallenneta messis botin omia viestejä
	if (message.author.id === Snowflakes.messisbot) {
		return;
	}
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
			let d = message.createdAt;
			// Tehdään itse sopiva datestring muotoa YYYY-MM-DD hh:mm jota mssql syö natiivisti
			let dateString = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
			cmd.addParameter('iServer_id', TYPES.NVarChar, message.guild.id.toString());
			cmd.addParameter('iChannel_id', TYPES.NVarChar, message.channel.id.toString());
			cmd.addParameter('iDiscord_message_id', TYPES.Int, 0);
			cmd.addParameter('iMessage_id', TYPES.NVarChar, message.id.toString());
			cmd.addParameter('dtMessage_date', TYPES.DateTime2, dateString);
			cmd.addParameter('strPerson_name', TYPES.NVarChar, message.author.username);
			cmd.addParameter('strMessage_text', TYPES.NVarChar, message.content.substring(0, 1999));
			cmd.addParameter('iUser_id', TYPES.NVarChar, message.author.id.toString());
			con.callProcedure(cmd);
		}
	});
};
