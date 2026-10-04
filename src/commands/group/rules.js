const fs = require("fs");
const path = require("path");
const { commandResponse } = require("../../utils/branding");
const FILE = path.join(__dirname, "../../../database/rules.json");

function load() { try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return {}; } }

module.exports = {
    name: "rules", aliases: ["grouprules"], category: "group",
    permission: "public", description: "Show the group rules.",
    usage: ".rules",
    async execute(context) {
        if (!context.isGroup) return commandResponse("❌ Groups only.");
        const r = load()[context.remoteJid];
        if (!r) return commandResponse("📜 No rules set yet.\nAdmins can set them with .setrules");
        return commandResponse(`📜 *GROUP RULES*\n\n${r}`);
    }
};
