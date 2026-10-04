const fs = require("fs");
const path = require("path");
const { commandResponse } = require("../../utils/branding");
const FILE = path.join(__dirname, "../../../database/menu-banner.jpg");

module.exports = {
    name: "setbanner", aliases: ["menubanner"], category: "system",
    permission: "owner", description: "Set the image shown with the menu.",
    usage: "Reply to an image with .setbanner  (or .setbanner off)",
    async execute(context) {
        if ((context.args?.[0] || "").toLowerCase() === "off") {
            fs.rmSync(FILE, { force: true });
            return commandResponse("🗑️ Menu banner removed.");
        }
        const msg = context.message?.message || {};
        const q = msg.extendedTextMessage?.contextInfo?.quotedMessage || {};
        const node = msg.imageMessage || q.imageMessage;
        if (!node) return commandResponse("🖼️ Reply to an image with .setbanner\nRemove it with .setbanner off");
        try {
            const b = await import("@whiskeysockets/baileys");
            const stream = await b.downloadContentFromMessage(node, "image");
            const chunks = [];
            for await (const c of stream) chunks.push(c);
            fs.writeFileSync(FILE, Buffer.concat(chunks));
            return commandResponse("✅ Banner saved. Send .menu to see it.");
        } catch { return commandResponse("❌ Couldn't save that image."); }
    }
};
