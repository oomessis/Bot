/*jslint node: true */
"use strict";

let app = require("./../bot.js");
let moment = require('moment');
let badges = require("./../Libraries/DatabaseLibrary/Badges.js");

const properties = {
	command: "badget",
	description: "Badgekomennot.",
	visible: true,
	arguments: ["<komento>"]
};

/**
 * Manage badget-commands
 * @param {*} message 
 * @param {*} args 
 */
function run(message, args) {
    let userID = '';
    if (message.channel.id !== app.snowflakes.skynetterminal && !(message.channel instanceof app.discord.DMChannel)) {
        message.channel.send('Badgekomento toimii toistaiseksi vain skynet-terminal kanavalla tai yksityisviestissä.').then(sentMsg => {
            message.delete(20000);
            sentMsg.delete(20000);
        });
    } else {
        if (typeof args[1] !== 'undefined') {
            if (args[1] === 'ohje') {
                listHelpText(message);
            } else {
                userID = findUserID(args[1]);
            }
        } else {
            // List user badges
            userID = message.author.id;
        }
    
        if (userID !== '') {
            listUserBadges(message, userID);
        }
    }
}

/**
 * Send embed message containing help about badges to message channel
 * @param {*} message 
 */
function listHelpText(message) {
    let embed = new app.discord.RichEmbed();
    let badgeGuide = '';
    embed.setTitle('Badge ohje:');
    embed.setAuthor(app.client.user.username, app.client.user.displayAvatarURL);
    badgeGuide += '**juttu** - Puheenaihe-badge joka annetaan kun viesti on hyvä puheenaihe ja aloitti siitä keskustelun. Ilmoitus kanaville: yleinen, puheenaiheet ja tuotantotiimin toimitukseen. \n';
    badgeGuide += '**idea** - Idea-badge joka annetaan hyvästä ideasta. Ilmoitus tuotantotiimin toimitukseen. \n';
    badgeGuide += '**lainaus** - Lainaus-badge joka annetaan hyvästä lainauksen arvoisesta viestistä. Ilmoitus tuotantotiimin toimitukseen. \n';
    badgeGuide += '**kultainensydan** - Kultainen sydän-badge joka annetaan kun viesti sisältää lämminsydämisen vastauksen toiselle yhteisöläiselle. Ilmoitus tuotantotiimin toimitukseen. \n';
    badgeGuide += '**toimitus** - Agenda-badge josta ilmoitus toimitustiimin agenda-feediin. \n';
    badgeGuide += '**ohjelma** - Agenda-badge josta ilmoitus ohjelmatiimin agenda-feediin. \n';
    badgeGuide += '**staffi** - Agenda-badge josta ilmoitus staffin agenda-feediin. \n';
    badgeGuide += '**tietohallinto** - Agenda-badge josta ilmoitus tietohallintotiimin agenda-feediin. \n';
    embed.setDescription(badgeGuide);
    message.channel.send(embed);    
}

/**
 * Find member by displayname or ID and return the found ID
 * @param {*} strUserNameOrID 
 */
function findUserID(strUserNameOrID) {
    let guild = app.client.guilds.get(app.snowflakes.messis);
    let oMember = guild.members.find(member => member.displayName.toLowerCase() === strUserNameOrID);
    if (!oMember) {
        // Try find user by ID
        oMember = guild.members.find(member => member.id === strUserNameOrID);
    }
    if (oMember) {
        return oMember.id;
    }
    return '';
}

/**
 * List all of users badges and send it to message channel
 * @param {*} userID 
 */
function listUserBadges(message, userID) {
    badges.getBadgeList(userID, function(err, badges) {
        if (err) {
            console.log(err);
        } else {
            let strList = '';
            let lastType = '';

            badges.forEach(element => {
                if (lastType === '') {
                    strList += `Käyttäjän **${element[0].value}** ansaitsemat badget: \n`;
                }
                if (lastType !== element[1].value) {
                    strList += `\n**${element[1].value}** \n`;
                    lastType = element[1].value;
                }

                let dt = moment(element[2].value);
                let strDt = dt.format('D.M.YYYY');
                strList += `${strDt} : ${element[3].value} \n`;
                if (element[4].value !== '') {
                    strList += "```" + element[4].value.split('`').join('') + "``` \n";
                }

                if (strList.length > 1700) {
                    message.channel.send(strList);
                    strList = '';
                }
            });
            if (strList !== '') {
                message.channel.send(strList);
            }
        }
    });
}

exports.properties = properties;
exports.run = run;
