const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "tag",
    aliases: ["mention"],
    category: "group",
    permission: "admin",
    description: "Mention selected group members.",
    usage: ".tag @user",

    async execute(context) {
        if (!context.isGroup) {
            return commandResponse("❌ This command can only be used in a group.");
        }

        const mentioned = context.message?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

        if (!mentioned.length) {
            return commandResponse(
`╭━━━〔 👥 VORTEX TAG 〕━━━╮
┃
┃  Mention someone when using
┃  the command.
┃
┃  Example:
┃  .tag @user
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }

        await context.sock.sendMessage(
            context.remoteJid,
            {
                text: `👋 ${mentioned.map(jid => `@${jid.split("@")[0]}`).join(" ")}`,
                mentions: mentioned
            }
        );

        return null;
    }
};
