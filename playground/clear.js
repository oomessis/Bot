/*jslint node: true */
"use strict";

const app = require("./../bot.js");

const properties = {
	command: "clear",
	description: "Tyhjää kanavan viesteistä.",
	visible: true,
	arguments: ["<id>"]
};

function run(message, args) {
    if (typeof args[1] !== 'undefined') {
        if (message.author.id === app.snowflakes.admin) {
            let channel = app.client.channels.get(args[1]);
            channel.fetchMessages({limit: 50}).then(messages => {
                /*
                channel.bulkDelete(messages).catch(err => {
                    console.log(err);
                    console.log(messages);
                });
                */
                messages.forEach(msg => {
                    msg.delete();
                });
            });
            
            /*
            async () => {
                let fetched;
                do {
                    fetched = await channel.fetchMessages({limit: 100});
                    //message.channel.bulkDelete(fetched);
                }
                while(fetched.size >= 2);
            }
            */
        }
    }
}
exports.properties = properties;
exports.run = run;

