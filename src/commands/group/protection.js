const { commandResponse } = require("../../utils/branding");
const { getSettings } = require("../../services/protection");

module.exports = {
    name: "protection",
    aliases: ["protect", "security"],
    category: "group",
    permission: "admin",
    description: "Show group protection settings.",
    usage: ".protection",

    async execute(context) {
        if (!context.isGroup) {
            return commandResponse("❌ Group command only.");
        }

        const settings = getSettings(context.remoteJid);

        return commandResponse(
`╭━━━〔 🛡️ VORTEX PROTECTION 〕━━━╮
┃
┃  🔗 Anti-Link : ${settings.antiLink ? "ON 🟢" : "OFF 🔴"}
┃  🚨 Anti-Spam : ${settings.antiSpam ? "ON 🟢" : "OFF 🔴"}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
