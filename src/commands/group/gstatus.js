const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "gstatus",
    aliases: ["groupstatus"],
    category: "group",
    permission: "public",
    description: "Show whether the group is open or closed.",
    usage: ".gstatus",

    async execute(context) {
        if (!context.isGroup) {
            return commandResponse("❌ This command can only be used in a group.");
        }

        const metadata = await context.sock.groupMetadata(context.remoteJid);

        const announcement = metadata.announce === true;

        return commandResponse(
`╭━━━〔 👥 VORTEX GROUP STATUS 〕━━━╮
┃
┃  📛 ${metadata.subject || "Group"}
┃  🔒 Mode : ${announcement ? "CLOSED" : "OPEN"}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
