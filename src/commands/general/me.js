const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "me",
    aliases: ["whoami"],
    category: "general",
    permission: "public",
    description: "Show your WhatsApp sender ID.",
    usage: ".me",

    async execute(context) {
        return commandResponse(
`╭━━━〔 🌀 VORTEX USER 〕━━━╮
┃
┃  👤 Sender : ${context.sender || "Unknown"}
┃  👑 Owner  : ${context.isOwner ? "YES" : "NO"}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
