const { commandResponse } = require("../../utils/branding");
const bot = require("../../services/chatbot");

module.exports = {
    name: "autoreply", aliases: ["ar", "rules"], category: "owner",
    permission: "owner", description: "Keyword auto-replies (no API needed).",
    usage: ".autoreply add price | It costs 50 cedis",
    async execute(context) {
        const [sub, ...rest] = context.args || [];
        const db = bot.load();
        const s = (sub || "").toLowerCase();
        if (s === "add") {
            const [k, ...r] = rest.join(" ").split("|");
            const key = (k || "").trim().toLowerCase();
            const reply = r.join("|").trim();
            if (!key || !reply) return commandResponse("Usage: .autoreply add price | It costs 50 cedis");
            db.rules = db.rules.filter(x => x.k !== key);
            db.rules.push({ k: key, r: reply });
            bot.save(db);
            return commandResponse(`✅ Rule saved for "${key}".\nIt fires in chats where the chatbot is on.`);
        }
        if (s === "del") {
            const key = rest.join(" ").trim().toLowerCase();
            db.rules = db.rules.filter(x => x.k !== key);
            bot.save(db);
            return commandResponse(`🗑️ Removed "${key}".`);
        }
        if (s === "list") {
            if (!db.rules.length) return commandResponse("No rules yet.");
            return commandResponse("📋 *Rules*\n\n" + db.rules.map((x, i) => `${i + 1}. ${x.k} → ${x.r.slice(0, 40)}`).join("\n"));
        }
        return commandResponse("Usage:\n.autoreply add <word> | <reply>\n.autoreply del <word>\n.autoreply list");
    }
};
