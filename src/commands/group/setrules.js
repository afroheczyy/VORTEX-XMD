const fs = require("fs");
const path = require("path");
const { commandResponse } = require("../../utils/branding");
const FILE = path.join(__dirname, "../../../database/rules.json");

module.exports = {
    name: "setrules", aliases: ["addrules"], category: "group",
    permission: "admin", description: "Set the group rules.",
    usage: ".setrules 1. Be kind  2. No spam   (or .setrules off)",
    async execute(context) {
        if (!context.isGroup) return commandResponse("❌ Groups only.");
        const text = (context.args || []).join(" ").trim();
        if (!text) return commandResponse("📜 Usage: .setrules 1. Be kind 2. No spam\nRemove: .setrules off");
        let db = {};
        try { db = JSON.parse(fs.readFileSync(FILE, "utf8")); } catch {}
        if (text.toLowerCase() === "off") delete db[context.remoteJid];
        else db[context.remoteJid] = text.slice(0, 1500);
        fs.mkdirSync(path.dirname(FILE), { recursive: true });
        fs.writeFileSync(FILE, JSON.stringify(db));
        return commandResponse(text.toLowerCase() === "off" ? "🗑️ Rules removed." : "✅ Rules saved. Members can see them with .rules");
    }
};
