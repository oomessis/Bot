let moment = require('moment');


class autoAnnounce {
    constructor(date, channel, message) {
        this.date = date;
        this.channel = channel;
        this.message = message;
    }
}
module.exports = autoAnnounce;