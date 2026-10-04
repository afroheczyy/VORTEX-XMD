const {
    commandResponse
} = require("../../utils/branding");

const config =
    require("../../../config/config");

module.exports = {
    name: "prefix",
    aliases: ["pre"],
    category: "general",
    permission: "public",
    description: "Show the current command prefix.",
    usage: ".prefix",

    async execute() {
        return commandResponse(
`╭━━━〔 🌀 VORTEX PREFIX 〕━━━╮
┃
┃  ⚡ Prefix : ${config.bot.prefix}
┃
┃  Example:
┃  ${config.bot.prefix}menu
┃  ${config.bot.prefix}ping
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
