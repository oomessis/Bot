const auth = require('../auth/auth');

exports.run = (client, message, args, level) => {
    let userName;
    userName = message.content.substring(8);
    userTest(message, userName);


    /**
     * Näyttää privaviestinä jäsenen avatar-urlin komennon antajalle
     * @param {*} msg
     * @param {*} u
     */
    function userTest(msg, u) {
        client.bot.logEvent("Avatar käyttäjästä " + u + " : " + msg.author.username);
        const guild = client.guilds.get(auth.messis);
        guild.members.filter(m => m.user.username === u).map(member => {
            msg.author.send(u + ' käyttäjän avatar url: ' + member.user.avatarURL);
        });
    }
};

exports.conf = {
    enabled: true,
    guildOnly: false,
    aliases: [],
    permLevel: "Käyttäjä"
};

exports.help = {
    name: "avatar",
    category: "Sekalainen",
    description: "Hakee annetulle käyttäjänimelle avatar-linkin ja lähettää sen privaattiviestinä. \n Komento ei sano mitään, jossei käyttäjän profiilia löytynyt.",
    usage: "avatar <käyttäjänimi>"
};