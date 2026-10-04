const { commandResponse } = require("../../utils/branding");
const config = require("../../../config/config");

module.exports = {
    name: "version",
    aliases: ["ver", "v"],
    category: "general",
    permission: "public",
    description: "Show VORTEX version.",
    usage: ".version",

    async execute() {
        return commandResponse(
`╭━━━〔 🌀 VORTEX VERSION 〕━━━╮
┃
┃  🤖 Bot     : ${config.botName}
┃  📦 Version : ${config.version}
┃  ⚡ Prefix  : ${config.bot.prefix}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
