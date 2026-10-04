const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "promote",
    aliases: ["admin"],
    category: "group",
    permission: "admin",
    description: "Promote a member to group admin.",
    usage: ".promote @user",

    async execute(context) {
        if (!context.isGroup) {
            return commandResponse("❌ Group command only.");
        }

        const mentioned =
            context.message?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (!mentioned.length) {
            return commandResponse("❌ Mention the member to promote.");
        }

        await context.sock.groupParticipantsUpdate(
            context.remoteJid,
            mentioned,
            "promote"
        );

        return commandResponse(
`╭━━━〔 👑 VORTEX PROMOTE 〕━━━╮
┃
┃  👤 Member promoted.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
