/*
		if (cmd === 'm' && msg.author.username === 'raybarg') {
			bot.bulkInterval = setInterval(function () {
				fetchBulkHistory(msg);
			}, 20000);

		} else if (cmd === "s" && msg.author.username === 'raybarg') {
			bot.syncInterval = setInterval(function () {
				syncHistory();
			}, 10000);

            
*/

/**
 * Hakee viestihistorian kanavalta
 */
function fetchBulkHistory() {
	let targetChannel = botClient.channels.get(snowflakes.yleinen);
	targetChannel.fetchMessages({limit: bot.maxFetch, before: bot.lastID}).then(messages => {
		bot.log(messages.size.toString());
		let msgArr = messages.array();
		for (let i = 0; i < msgArr.length; i++) {
			discordMessage.save(msgArr[i]);
		}
		if (messages.size < bot.maxFetch) {
			clearInterval(bot.bulkInterval);
		} else {
			bot.lastID = msgArr[msgArr.length - 1].id;
		}

	}).catch(console.error);
}

/**
 * Intervaalikutsu uusien viestien synccaukseen
 */
function syncHistory() {
	bot.getLastID(function (err, lastMsgID) {
		if (err) {
			console.log(err);
		} else {
			syncNewMessages(lastMsgID);
		}
	});
}

/**
 * Hakee lastMsgID tokenin jälkeen tulleet uudet viestit
 * @param {*} lastMsgID Tokeni jonka jälkeen tulleita viestejä haetaan
 */
function syncNewMessages(lastMsgID) {
	let targetChannel = botClient.channels.get(snowflakes.yleinen);
	targetChannel.fetchMessages({limit: bot.maxFetch, after: lastMsgID}).then(messages => {
		if (messages.size > 0) {
			bot.log(messages.size.toString() + " / " + bot.maxFetch.toString());
		}
		if (messages.size > 0) {
			bot.messagesSynced += messages.size;
			let d = new Date();
			let thisHour = d.getHours();
			if (thisHour !== bot.lastHour) {
				if (bot.messagesSynced > 0) {
					bot.logEvent("Syncronoitu viestejä: " + bot.messagesSynced.toString());
				}

				bot.lastHour = thisHour;
				bot.messagesSynced = 0;
			}
		}
		let msgArr = messages.array();
		for (let i = 0; i < msgArr.length; i++) {
			discordMessage.save(msgArr[i]);
		}
	}).catch(console.error);
}
