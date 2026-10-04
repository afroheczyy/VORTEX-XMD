const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "dice",
    aliases: ["die"],
    category: "fun",
    permission: "public",
    description: "Roll a six-sided dice.",
    usage: ".dice",

    async execute() {
        const result = Math.floor(Math.random() * 6) + 1;

        return commandResponse(
`╭━━━〔 🎲 VORTEX DICE 〕━━━╮
┃
┃  🎲 You rolled : ${result}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
