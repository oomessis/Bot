/**
 * Luodaan huomioviesti discord viestistä
 * @param {*} message 
 */
exports.announcementFromMessage = (message) => {
	let content = message.content.split('`').join(''); // Embediin viestisisältö josta stripattu embedimerkit
	return 'Kanavalla: ' + message.channel + ' ' + 'käyttäjältä: '+  message.author + '\n<' + message.url + '>' +  '\n```' + content + '```';
}

