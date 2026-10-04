const { commandResponse } = require("../../utils/branding");
const { isSelf } = require("../../utils/target");
module.exports = {
    name: "delete", aliases: ["del", "d"], category: "group",
    permission: "admin", description: "Delete a replied message.",
    usage: "Reply to a message with .delete",
    async execute(context) {
        if (!context.isGroup) return commandResponse("❌ Groups only.");
        const ci = context.message?.message?.extendedTextMessage?.contextInfo;
        if (!ci?.stanzaId) return commandResponse("🗑️ Reply to a message with .delete");
        try {
            await context.sock.sendMessage(context.remoteJid, {
                delete: {
                    remoteJid: context.remoteJid,
                    fromMe: isSelf(context.sock, ci.participant),
                    id: ci.stanzaId,
                    participant: ci.participant
                }
            });
            return null;
        } catch { return commandResponse("❌ I need to be a group admin to delete that."); }
    }
};
