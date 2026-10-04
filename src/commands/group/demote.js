const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "demote",
    aliases: ["unadmin"],
    category: "group",
    permission: "admin",
    description: "Remove admin status from a member.",
    usage: ".demote @user",

    async execute(context) {
        if (!context.isGroup) {
            return commandResponse("❌ Group command only.");
        }

        const mentioned =
            context.message?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (!mentioned.length) {
            return commandResponse("❌ Mention the admin to demote.");
        }

        await context.sock.groupParticipantsUpdate(
            context.remoteJid,
            mentioned,
            "demote"
        );

        return commandResponse(
`╭━━━〔 🔻 VORTEX DEMOTE 〕━━━╮
┃
┃  👤 Admin demoted.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
