/*jslint node: true */
"use strict";

const Discord = require('discord.js');
const PImage = require('pureimage');
const fs = require('fs');
const snowflakes = require('./../auth/snowflakes.json');
const app = require("./../bot.js");

const properties = {
	command: "imba",
	description: "Testikomento.",
	visible: true,
	arguments: []
};

function run(message) {
    // Testataan miten voisi piirtää suomen kartta missä on määräpallukoita
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
            message.channel.send({files: [file], embed: embedThing}).then((msg) => {
                console.log(msg);
                fs.unlinkSync('assets/test.png');
            });
        });
    });
}
exports.properties = properties;
exports.run = run;
