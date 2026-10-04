const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "meal", aliases: ["recipe", "food"], category: "search",
    permission: "public", description: "Find a recipe (or get a random one).",
    usage: ".meal chicken   or   .meal",
    async execute(context) {
        const q = (context.args || []).join(" ").trim();
        try {
            const url = q
                ? `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`
                : "https://www.themealdb.com/api/json/v1/1/random.php";
            const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
            const m = (await r.json()).meals?.[0];
            if (!m) throw new Error();
            const ing = [];
            for (let i = 1; i <= 20; i++) {
                const n = m["strIngredient" + i];
                if (n && n.trim()) ing.push(`• ${(m["strMeasure" + i] || "").trim()} ${n.trim()}`.replace("•  ", "• "));
            }
            const text = commandResponse(
`*🍽️ ${m.strMeal}*
_${m.strCategory} · ${m.strArea}_

*Ingredients*
${ing.join("\n")}

*Method*
${String(m.strInstructions || "").replace(/\r?\n+/g, "\n").slice(0, 900)}…`);
            if (m.strMealThumb) { await context.sock.sendMessage(context.remoteJid, { image: { url: m.strMealThumb }, caption: text }, { quoted: context.message }); return null; }
            return text;
        } catch { return commandResponse(`❌ No recipe found${q ? ' for "' + q + '"' : ""}.`); }
    }
};
