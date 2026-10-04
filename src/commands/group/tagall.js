const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "tagall",
    aliases: ["everyone", "all"],
    category: "group",
    permission: "admin",
    description: "Mention all group members.",
    usage: ".tagall [message]",

    async execute(context) {
        if (!context.isGroup) {
            return commandResponse("❌ This command can only be used in a group.");
        }

        const metadata = await context.sock.groupMetadata(context.remoteJid);
        const participants = metadata.participants || [];

        const text = context.args?.join(" ") || "Attention everyone! 🌀";

        await context.sock.sendMessage(
            context.remoteJid,
            {
                text,
                mentions: participants.map(p => p.id)
            }
        );

        return null;
    }
};
