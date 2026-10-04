const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "id",
    aliases: ["jid"],
    category: "general",
    permission: "public",
    description: "Show the current chat ID.",
    usage: ".id",

    async execute(context) {
        return commandResponse(
`╭━━━〔 🌀 VORTEX CHAT ID 〕━━━╮
┃
┃  🆔 JID : ${context.remoteJid || "Unknown"}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
