const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "unmute",
    aliases: ["open"],
    category: "group",
    permission: "admin",
    description: "Open the group for members.",
    usage: ".unmute",

    async execute(context) {
        if (!context.isGroup) {
            return commandResponse("❌ Group command only.");
        }

        await context.sock.groupSettingUpdate(
            context.remoteJid,
            "not_announcement"
        );

        return commandResponse(
`╭━━━〔 🔓 VORTEX UNMUTE 〕━━━╮
┃
┃  🔓 Group is now open.
┃  👥 Members can send messages.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
