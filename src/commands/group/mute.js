const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "mute",
    aliases: ["close"],
    category: "group",
    permission: "admin",
    description: "Close the group for members.",
    usage: ".mute",

    async execute(context) {
        if (!context.isGroup) {
            return commandResponse("❌ Group command only.");
        }

        await context.sock.groupSettingUpdate(
            context.remoteJid,
            "announcement"
        );

        return commandResponse(
`╭━━━〔 🔒 VORTEX MUTE 〕━━━╮
┃
┃  🔒 Group is now closed.
┃  👑 Only admins can send messages.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
