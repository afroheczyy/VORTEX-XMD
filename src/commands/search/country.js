const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "country", aliases: ["nation"], category: "search",
    permission: "public", description: "Get facts about a country.",
    usage: ".country Ghana",
    async execute(context) {
        const q = (context.args || []).join(" ").trim();
        if (!q) return commandResponse("🌍 Usage: .country Ghana");
        try {
            const r = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(q)}?fields=name,capital,population,region,languages,currencies,flag`,
                { signal: AbortSignal.timeout(10000) });
            if (!r.ok) throw new Error();
            const c = (await r.json())[0];
            const cur = Object.values(c.currencies || {}).map(x => `${x.name} (${x.symbol || ""})`).join(", ");
            return commandResponse(
`🌍 *${c.name.common}* ${c.flag || ""}

🏛️ Capital    : ${(c.capital || ["-"])[0]}
🌐 Region     : ${c.region}
👥 Population : ${c.population.toLocaleString()}
🗣️ Languages  : ${Object.values(c.languages || {}).join(", ")}
💰 Currency   : ${cur}`);
        } catch { return commandResponse(`❌ Couldn't find "${q}".`); }
    }
};
