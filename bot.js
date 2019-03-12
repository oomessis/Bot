// This will check if the node version you are running is the required
// Node version, if it isn't it will throw the following error to inform
// you.
if (Number(process.version.slice(1).split(".")[0]) < 8) throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");


// Load up the discord.js library
const Discord = require("discord.js");
// We also load the rest of the things we need in this file:
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");
const BotCommon = require('./Libraries/BotLibrary/botcommon.js');

// This is your messisBot. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `messisBot.something`,
// or `bot.something`, this is what we're refering to. Your messisBot.

const auth = require("./auth/auth.json");

const messisBot = new Discord.Client();

messisBot.bot = new BotCommon();

// Here we load the config file that contains our token and our prefix values.
messisBot.config = require("./config.js");
// messisBot.config.token contains the bot's token
// messisBot.config.prefix contains the message prefix

// Require our logger
messisBot.logger = require("./modules/Logger");

// Let's start by getting some useful functions that we'll use throughout
// the bot, like logs and elevation features.
require("./modules/functions.js")(messisBot);


// Aliases and commands are put in collections where they can be read from,
// catalogued, listed, etc.
messisBot.commands = new Enmap();
messisBot.aliases = new Enmap();

// Now we integrate the use of Evie's awesome Enhanced Map module, which
// essentially saves a collection to disk. This is great for per-server configs,
// and makes things extremely easy for this purpose.
messisBot.settings = new Enmap({name: "settings"});


// We're doing real fancy node 8 async/await stuff here, and to do that
// we need to wrap stuff in an anonymous function. It's annoying but it works.

const init = async () => {

	// Here we load **commands** into memory, as a collection, so they're accessible
	// here and everywhere else.
	const cmdFiles = await readdir("./commands/");
	messisBot.logger.log(`Loading a total of ${cmdFiles.length} commands.`);
	cmdFiles.forEach(f => {
		if (!f.endsWith(".js")) return;
		const response = messisBot.loadCommand(f);
		if (response) console.log(response);
	});

	// Then we load events, which will include our message and ready event.
	const evtFiles = await readdir("./events/");
	messisBot.logger.log(`Loading a total of ${evtFiles.length} events.`);
	evtFiles.forEach(file => {
		const eventName = file.split(".")[0];
		messisBot.logger.log(`Loading Event: ${eventName}`);
		const event = require(`./events/${file}`);
		// Bind the messisBot to any event, before the existing arguments
		// provided by the discord.js event.
		// This line is awesome by the way. Just sayin'.
		messisBot.on(eventName, event.bind(null, messisBot));
	});

	// Generate a cache of messisBot permissions for pretty perm names in commands.
	messisBot.levelCache = {};
	for (let i = 0; i < messisBot.config.permLevels.length; i++) {
		const thisLevel = messisBot.config.permLevels[i];
		messisBot.levelCache[thisLevel.name] = thisLevel.level;
	}

	// Here we login the messisBot.
	messisBot.login(messisBot.config.token);

// End top-level async/await function.
};

init();


module.exports = messisBot;