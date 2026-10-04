const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "games",
    aliases: ["gamemenu"],
    category: "games",
    permission: "public",
    description: "Show VORTEX games.",
    usage: ".games",

    async execute() {
        return commandResponse(
`╭━━━〔 🎮 VORTEX GAMES 〕━━━╮
┃
┃  ⬡ .guess <1-10>
┃  ⬡ .rps <choice>
┃  ⬡ .trivia
┃  ⬡ .roll [max]
┃
┃  More games coming. 🌀
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
