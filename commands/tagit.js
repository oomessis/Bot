/*jslint node: true */
"use strict";

let app = require("./../bot.js");
let messisUser = require("./../Libraries/DatabaseLibrary/MessisUser.js");
let messisUserTags = require("./../Libraries/DatabaseLibrary/MessisUserTags.js");

const properties = {
	command: "tagit",
	description: "Lisää/poistaa annettuja tageja userille",
	visible: true,
	arguments: ["<user> <tagit>"]
};

/**
 * Run command "tagit"
 * @param {*} message 
 * @param {*} args 
 */
function run(message, args) {
    if (typeof args[1] !== 'undefined') {
        let guild = app.client.guilds.get(app.snowflakes.messis);
        let member = guild.members.get(message.author.id);
        if (message.author.id === app.snowflakes.admin || member.roles.has(app.snowflakes.tuotantotiimi) || member.roles.has(app.snowflakes.yllapito)) {
            let strUser = args[1];
            if (strUser == '0' && args.length === 3) {
                messisUserTags.getUsersByTag(args[2], function(err, colUsers) {
                    message.channel.send(listUsers_RichEmbed(colUsers, args[2]));
                });
            } else {
                // Find user by name
                let oMember = guild.members.find(member => member.displayName.toLowerCase() === strUser);
                if (!oMember) {
                    // Try find user by ID
                    oMember = guild.members.find(member => member.id === strUser);
                }
                if (oMember) {
                    // Save/Update user in DB
                    messisUser.save(oMember.id, oMember.displayName, oMember.joinedAt, function(err, iState) {
                        messisUser.getUserByDiscordID(oMember.id, function (err, oMessisUser) {
                            if (err) {
                                console.log(err);
                            } else {
                                if (oMessisUser) {
                                    messisUserTags.getUserTags(oMessisUser.ID, function(err, userTags) {
                                        if (args.length === 2) {
                                            // No tags, lets print users tags
                                            if (!userTags || userTags.length === 0) {
                                                message.channel.send("Käyttäjällä ei ole tageja.");
                                            } else {
                                                message.channel.send(listTags_RichEmbed(userTags, oMessisUser));
                                            }
                                
                                        } else if (args.length > 2) {
                                            let newTags = [];
                                            // Tags given, lets save them for user
                                            for (let i = 2; i < args.length; i++) {
                                                if (!userTags.includes(args[i])) {
                                                    newTags.push(args[i]);
                                                }
                                            }
                                            messisUserTags.saveUserTags(oMessisUser.ID, newTags.join(","), function(err, iState) {
                                                message.channel.send("Tagit tallennettu käyttäjälle.");
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    });
                }
            }
        }
    }
}

/**
 * Create discord.RichEmbed from tags list
 * @param {*} tags 
 * @param {*} messisUser 
 */
function listTags_RichEmbed(tags, messisUser) {
    let embed = new app.discord.RichEmbed();
    embed.setTitle('Käyttäjän `' + messisUser.DiscordUserName + '` tagit:');

    let tagsString = '';
    tags.forEach(tag => {
        tagsString += '`' + tag + '`  ';
    });
    embed.setDescription(tagsString);

    return embed;
}

/**
 * Create discord.RichEmbed from list of users
 * @param {*} users 
 * @param {*} tag 
 */
function listUsers_RichEmbed(users, tag) {
    let embed = new app.discord.RichEmbed();
    embed.setTitle('Tagin `' + tag + '` käyttäjät:');

    let usersString = '';
    users.forEach(user => {
        usersString += '`' + user + '`  ';
    });
    embed.setDescription(usersString);

    return embed;
}

exports.properties = properties;
exports.run = run;

