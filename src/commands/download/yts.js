const { commandResponse } = require("../../utils/branding");
const api = require("../../services/mediaapi");

module.exports = {
    name: "yts", aliases: ["ytsearch", "youtube"], category: "download",
    permission: "public", description: "Search YouTube.",
    usage: ".yts afrobeats 2026",
    async execute(context) {
        const q = (context.args || []).join(" ").trim();
        if (!q) return commandResponse("🔎 Usage: .yts afrobeats 2026");
        try {
            const r = (await api.search(q)).slice(0, 5);
            if (!r.length) return commandResponse(`❌ Nothing found for "${q}".`);
            const rows = r.map((v, i) => `*${i + 1}. ${v.title}*\n⏱️ ${v.duration} · 👤 ${v.author || "?"}\n🔗 ${v.url}`);
            return commandResponse(`*🔎 YouTube: ${q}*\n\n${rows.join("\n\n")}\n\n_Get one with .play <name or link>_`);
        } catch (e) {
            return commandResponse("❌ " + String(e.message).slice(0, 160));
        }
    }
};
