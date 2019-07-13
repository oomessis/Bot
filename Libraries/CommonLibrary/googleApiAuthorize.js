let fs = require('fs');
let readline = require('readline');
let { google } = require('googleapis');

class googleAPIAuthorize {
    constructor(authFile, tokenFile, scopes, callback, caller) {
        this.authFile = authFile;
        this.tokenFile = tokenFile;
        this.callback = callback;
        this.caller = caller;
        this.scopes = scopes;
    }

    auth() {
        fs.readFile(this.authFile, (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            this.authorize(this, JSON.parse(content), this.callback);
        });
    }

    /**
     * Authorize with Google OAuth2
     * @param {googleAPIAuthorize} authorizer The authorizing object (contains tokenFile and caller)
     * @param {*} credentials 
     * @param {*} callback 
     */
    authorize(authorizer, credentials, callback) {
        let { client_secret, client_id, redirect_uris } = credentials.installed;
        let oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
    
        // Check if we have previously stored a token.
        fs.readFile(authorizer.tokenFile, (err, token) => {
            if (err) return this.getAccessToken(authorizer, oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(authorizer.caller, oAuth2Client);
        });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {googleAPIAuthorize} authorizer The authorizing object (contains scopes and tokenFile)
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    getAccessToken(authorizer, oAuth2Client, callback) {
        let authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: authorizer.scopes,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        let rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(authorizer.tokenFile, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', authorizer.tokenFile);
                });
                callback(oAuth2Client);
            });
        });
    }

}
module.exports = googleAPIAuthorize;