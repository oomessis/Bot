/*jslint node: true */
"use strict";

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const moment = require('moment');

const app = require("./../bot.js");

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const TOKEN_PATH = './auth/token.json';

const properties = {
    command: "calendar",
    description: "",
    visible: true,
    arguments: []
};

function run(message) {
    let guild = app.client.guilds.get(app.snowflakes.messis);
    let member = guild.members.get(message.author.id);
    if (message.author.id === app.snowflakes.admin || member.roles.has(app.snowflakes.tuotantotiimi) || member.roles.has(app.snowflakes.yllapito)) {
        // Load client secrets from a local file.
        fs.readFile('./auth/googlecalendar.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            authorize(message, JSON.parse(content), listEvents);
        });
    }
}

function authorize(message, credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(message, oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(message, auth) {
    const calendar = google.calendar({ version: 'v3', auth });
    let startOfWeek = moment().startOf('week').toDate();
    let endOfWeek = moment().endOf('week').toDate();
    let embed = new app.discord.RichEmbed();

    calendar.events.list({
        calendarId: app.snowflakes.calendarid,
        timeMin: startOfWeek.toISOString(),
        timeMax: endOfWeek.toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        if (events.length) {
            let eventList = '';
            embed.setTitle('Kuluvan viikon ohjelmakalenterin tapahtumat:');

            events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                console.log(`${start} - ${event.summary}`);

                let txt = `${moment(start).format('DD.MM.YYYY')} - ${event.summary}`;
                
                if (event.start.dateTime) {
                    let startTime = moment(start).format('HH:mm');
                    txt += ` (Kello ${startTime})`;
                }
                txt += '\n';
                eventList += txt;
            });

            embed.setDescription(eventList);
            message.channel.send(embed);

        } else {
            console.log('No upcoming events found.');
        }
    });
}
exports.properties = properties;
exports.run = run;