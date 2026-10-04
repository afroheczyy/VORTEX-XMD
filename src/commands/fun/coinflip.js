const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "coinflip",
    aliases: ["coin", "flip"],
    category: "fun",
    permission: "public",
    description: "Flip a virtual coin.",
    usage: ".coinflip",

    async execute() {
        const result = Math.random() < 0.5 ? "HEADS 🪙" : "TAILS 🪙";

        return commandResponse(
`╭━━━〔 🪙 VORTEX COINFLIP 〕━━━╮
┃
┃  Result : ${result}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
