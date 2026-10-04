const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "qr", aliases: ["qrcode"], category: "search",
    permission: "public", description: "Generate a QR code from text or a link.",
    usage: ".qr <text or link>",
    async execute(context) {
        const text = (context.args || []).join(" ").trim();
        if (!text) return commandResponse("🔳 Usage: .qr https://example.com");
        try {
            await context.sock.sendMessage(context.remoteJid, {
                image: { url: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(text)}` },
                caption: "🔳 Your QR code"
            }, { quoted: context.message });
            return null;
        } catch { return commandResponse("❌ Couldn't make the QR code."); }
    }
};
