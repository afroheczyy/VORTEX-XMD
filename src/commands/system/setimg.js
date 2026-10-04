const fs = require("fs");
const path = require("path");
const { commandResponse } = require("../../utils/branding");
const DIR = path.join(__dirname, "../../../database/banners");

module.exports = {
    name: "setimg", aliases: ["cardimg"], category: "system",
    permission: "owner", description: "Set the picture used by a command.",
    usage: "Reply to an image: .setimg ping  (or .setimg ping off)",
    async execute(context) {
        const name = (context.args?.[0] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (!name) return commandResponse("🖼️ Reply to an image with:\n.setimg ping\n.setimg alive\nRemove: .setimg ping off");
        const file = path.join(DIR, name + ".jpg");
        if ((context.args?.[1] || "").toLowerCase() === "off") {
            fs.rmSync(file, { force: true });
            return commandResponse(`🗑️ Removed the ${name} picture.`);
        }
        const msg = context.message?.message || {};
        const q = msg.extendedTextMessage?.contextInfo?.quotedMessage || {};
        const node = msg.imageMessage || q.imageMessage;
        if (!node) return commandResponse("🖼️ Reply to an image with .setimg " + name);
        try {
            const b = await import("@whiskeysockets/baileys");
            const stream = await b.downloadContentFromMessage(node, "image");
            const chunks = [];
            for await (const c of stream) chunks.push(c);
            fs.mkdirSync(DIR, { recursive: true });
            fs.writeFileSync(file, Buffer.concat(chunks));
            return commandResponse(`✅ Saved. .${name} will now come with this picture.`);
        } catch { return commandResponse("❌ Couldn't save that image."); }
    }
};
