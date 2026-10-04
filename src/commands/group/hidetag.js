const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "hidetag", aliases: ["ht", "silenttag"], category: "group",
    permission: "admin", description: "Notify everyone without showing @mentions.",
    usage: ".hidetag <message>",
    async execute(context) {
        if (!context.isGroup) return commandResponse("❌ Groups only.");
        let text = (context.args || []).join(" ").trim();
        if (!text) {
            const q = context.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            text = q?.conversation || q?.extendedTextMessage?.text || "";
        }
        if (!text) return commandResponse("👻 Usage: .hidetag Meeting at 8pm\n(or reply to a message)");
        try {
            const meta = await context.sock.groupMetadata(context.remoteJid);
            await context.sock.sendMessage(context.remoteJid, {
                text,
                mentions: meta.participants.map(p => p.id)
            });
            return null;
        } catch { return commandResponse("❌ Couldn't send the hidden tag."); }
    }
};
