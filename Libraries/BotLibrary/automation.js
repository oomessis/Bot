/*jslint node: true */
let { google } = require('googleapis');
let moment = require('moment');
let autoAnnounce = require('./auto_announce.js');
let googleApiAuthorize = require('./../CommonLibrary/googleApiAuthorize.js');

class automation {
    constructor(sheetid) {
        this.sheetid = sheetid;
        this.autoList = [];
        this.read();

        this.autoInterval = setInterval(function() {
            console.log("Heartbeat!");
        }, 1000);
    }

    read() {
        let auth = new googleApiAuthorize(
            './auth/googlesheet_automatisointi.json',
            './auth/token_auto_announcements.json',
            ['https://www.googleapis.com/auth/spreadsheets.readonly'],
            this.getList,
            this
        );
        auth.auth();
    }
   
    getList(autom, auth) {
        let sheets = google.sheets({version: 'v4', auth});
        sheets.spreadsheets.values.get({
            spreadsheetId: autom.sheetid,
            range: 'Sheet1!A1:C',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            let rows = res.data.values;
            if (rows.length) {
                rows.map((row) => {
                    let autoTime = moment(row[0], 'DD.MM.YYYY hh:mm').toDate();
                    if (moment().isBefore(autoTime)) {
                        console.log(`${row[0]}, ${row[2]} = ${autoTime}`);

                        let announce = new autoAnnounce(autoTime, row[1], row[2]);
                        autom.autoList.push(announce);
                    }
                });
            } else {
                console.log('No data found.');
            }
        });
    }
}
module.exports = automation;
