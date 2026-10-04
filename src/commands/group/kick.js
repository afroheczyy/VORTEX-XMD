const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "kick",
    aliases: ["remove"],
    category: "group",
    permission: "admin",
    description: "Remove a member from the group.",
    usage: ".kick @user",

    async execute(context) {
        if (!context.isGroup) {
            return commandResponse("❌ Group command only.");
        }

        const mentioned =
            context.message?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (!mentioned.length) {
            return commandResponse("❌ Mention the member you want to remove.");
        }

        await context.sock.groupParticipantsUpdate(
            context.remoteJid,
            mentioned,
            "remove"
        );

        return commandResponse(
`╭━━━〔 👢 VORTEX KICK 〕━━━╮
┃
┃  👤 Member removed.
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
