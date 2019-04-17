/*jslint node: true */
"use strict";
const Discord = require('discord.js');
const PImage = require('pureimage');
const fs = require('fs');
const snowflakes = require('../../auth/snowflakes.json');

class paikkakunnat {
    /**
     * Testataan miten voisi piirtää suomen kartta missä on määräpallukoita
     * @param {*} channel 
     * @param {*} loc 
     */
    static paikkaKuntaStat(channel, loc) {
        // Ladataan suomikuva
        PImage.decodePNGFromStream(fs.createReadStream('assets/suomi.png')).then((img) => {
            // Otetaan 2d-context-kahva ja piirretään kuvaan pari ymbyrää
            const ctx = img.getContext('2d');
            ctx.fillStyle = 'rgba(255,0,0,0.5)';
            ctx.beginPath();
            ctx.arc(370, 1320, 50, 0, 2 * Math.PI);
            ctx.arc(170, 930, 20, 0, 2 * Math.PI);
            ctx.fill();
            // Tallennetaan kuva
            PImage.encodePNGToStream(img, fs.createWriteStream('assets/test.png')).then(() => {
                // Luodaan attachment
                const file = new Discord.Attachment('assets/test.png');
                // Embed
                const embedThing = {
                    title: 'Sijaintitilastotesti',
                    image: {
                        utl: 'attachment://test.png'
                    }
                };
                // Postataan
                channel.send({files: [file], embed: embedThing}).then((msg) => {
                    console.log(msg);
                    fs.unlinkSync('assets/test.png');
                });
            });
        });
    }

    /**
     * Lisää/poistaa annetun paikkakunnan kanavan oikeudet kutsuvalta käyttäjältä, lähettää viestin jos annettua kanavaa ei löytynyt
     * @param {*} strPaikkakunta 
     * @param {*} author 
     */
    static managePaikkakunta(messisBot, strPaikkakunta, author, channel, bPrivate) {
        const channels = messisBot.channels.filter(ch => ch.parentID === snowflakes.categoryPaikkakunnat && ch.name.toLowerCase() === strPaikkakunta.toLowerCase());
        if(channels.size > 0) {
            channels.forEach(ch => {
                const perms = ch.permissionOverwrites.get(author.id);
                if(perms) {
                    // poistetaan
                    ch.permissionOverwrites.get(author.id).delete();
                    const reply = 'Oikeudet kanavalle `' + strPaikkakunta + '` poistettu.';
                    if (bPrivate) {
                        author.send(reply);
                    } else {
                        channel.send(reply);
                    }
                } else {
                    // lisätään
                    ch.overwritePermissions(author.id, {
                        VIEW_CHANNEL: true,
                        SEND_MESSAGES: true,
                        READ_MESSAGE_HISTORY: true
                    }, 'Bottikomento');
                    const reply = 'Oikeudet kanavalle `' + strPaikkakunta + '` lisätty.';
                    if (bPrivate) {
                        author.send(reply);
                    } else {
                        channel.send(reply);
                    }
                }
            });
        } else {
            const reply = 'Kanavaa `' + strPaikkakunta + '` ei löytynyt.';
            if (bPrivate) {
                author.send(reply);
            } else {
                channel.send(reply);
            }
        }
    }
}
module.exports = paikkakunnat;
