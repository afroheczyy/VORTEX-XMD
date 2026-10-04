const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "anime", aliases: ["ani"], category: "search",
    permission: "public", description: "Look up an anime.",
    usage: ".anime naruto",
    async execute(context) {
        const q = (context.args || []).join(" ").trim();
        if (!q) return commandResponse("🎌 Usage: .anime naruto");
        try {
            const r = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1&sfw=true`, { signal: AbortSignal.timeout(15000) });
            const a = (await r.json()).data?.[0];
            if (!a) throw new Error();
            const text = commandResponse(
`*🎌 ${a.title}*
${a.title_english && a.title_english !== a.title ? "_" + a.title_english + "_\n" : ""}
⭐ Score    : ${a.score ?? "N/A"}
📺 Episodes : ${a.episodes ?? "?"}
📌 Status   : ${a.status}
🎭 Genres   : ${(a.genres || []).map(g => g.name).join(", ") || "-"}

${String(a.synopsis || "").slice(0, 450)}${(a.synopsis || "").length > 450 ? "…" : ""}

🔗 ${a.url}`);
            const img = a.images?.jpg?.image_url;
            if (img) { await context.sock.sendMessage(context.remoteJid, { image: { url: img }, caption: text }, { quoted: context.message }); return null; }
            return text;
        } catch { return commandResponse(`❌ Nothing found for "${q}".`); }
    }
};
