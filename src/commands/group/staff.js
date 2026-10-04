const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "staff",
    aliases: ["admins", "adminlist"],
    category: "group",
    permission: "public",
    description: "Show group administrators.",
    usage: ".staff",

    async execute(context) {
        if (!context.isGroup) {
            return commandResponse("❌ This command can only be used in a group.");
        }

        const metadata = await context.sock.groupMetadata(context.remoteJid);

        const admins = (metadata.participants || [])
            .filter(p => p.admin)
            .map(p => `• @${p.id.split("@")[0]}`);

        return {
            text:
`╭━━━〔 👑 VORTEX STAFF 〕━━━╮
┃
┃  ${admins.length ? admins.join("\n┃  ") : "No admins found."}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n╰─ Powered by Hector 🌀`,
            mentions: (metadata.participants || [])
                .filter(p => p.admin)
                .map(p => p.id)
        };
    }
};
