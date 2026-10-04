const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "groupinfo",
    aliases: ["ginfo"],
    category: "group",
    permission: "public",
    description: "Show basic group information.",
    usage: ".groupinfo",

    async execute(context) {
        if (!context.isGroup) {
            return commandResponse("❌ This command can only be used in a group.");
        }

        const metadata = await context.sock.groupMetadata(context.remoteJid);

        return commandResponse(
`╭━━━〔 👥 VORTEX GROUP 〕━━━╮
┃
┃  📛 Name    : ${metadata.subject || "Unknown"}
┃  👥 Members : ${metadata.participants?.length || 0}
┃  🆔 JID     : ${context.remoteJid}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
