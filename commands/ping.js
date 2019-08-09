/*jslint node: true */
"use strict";

const app = require("./../bot.js");

const properties = {
    command: "ping",
    description: "Tulostaa kuinka iso viive on",
    visible: true,
    arguments: []
};

async function run(message) {
    // Calculates ping between sending a message and editing it, giving a nice rount-trip latency.
    // The second ping is an avg latency between the bot and the websocket server (one-way, not round-trip)
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Botin viive on ${m.createdTimestamp - message.createdTimestamp}ms. ` +
        `API:n viive on ${Math.round(client.ping)}ms.`);
}

exports.properties = properties;
exports.run = run;