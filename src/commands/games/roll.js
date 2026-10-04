const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "roll",
    aliases: ["random"],
    category: "games",
    permission: "public",
    description: "Roll a random number.",
    usage: ".roll [max]",

    async execute(context) {
        const max = Number(context.args?.[0]) || 100;

        if (!Number.isInteger(max) || max < 2 || max > 1000000) {
            return commandResponse("❌ Maximum must be between 2 and 1,000,000.");
        }

        const result = Math.floor(Math.random() * max) + 1;

        return commandResponse(
`╭━━━〔 🎲 VORTEX ROLL 〕━━━╮
┃
┃  🎲 Range : 1-${max}
┃  🎯 Result: ${result}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
