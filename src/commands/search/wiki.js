const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "wiki", aliases: ["wikipedia"], category: "search",
    permission: "public", description: "Get a Wikipedia summary.",
    usage: ".wiki <topic>",
    async execute(context) {
        const q = (context.args || []).join(" ").trim();
        if (!q) return commandResponse("📚 Usage: .wiki Ghana");
        try {
            const r = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.replace(/ /g, "_"))}`,
                { headers: { "User-Agent": "VortexBot/1.0" }, signal: AbortSignal.timeout(10000) });
            if (!r.ok) throw new Error();
            const d = await r.json();
            if (!d.extract) throw new Error();
            return commandResponse(`📚 *${d.title}*\n\n${d.extract.slice(0, 900)}\n\n🔗 ${d.content_urls?.mobile?.page || ""}`);
        } catch { return commandResponse(`❌ Nothing found for "${q}".`); }
    }
};
