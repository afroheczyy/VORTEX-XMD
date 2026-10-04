const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "pokemon", aliases: ["poke", "pokedex"], category: "search",
    permission: "public", description: "Pokédex entry.",
    usage: ".pokemon pikachu",
    async execute(context) {
        const q = (context.args?.[0] || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
        if (!q) return commandResponse("⚡ Usage: .pokemon pikachu");
        try {
            const r = await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`, { signal: AbortSignal.timeout(15000) });
            if (!r.ok) throw new Error();
            const p = await r.json();
            const st = n => p.stats.find(s => s.stat.name === n)?.base_stat ?? "?";
            const text = commandResponse(
`*⚡ ${p.name.toUpperCase()}*  #${p.id}

🏷️ Type    : ${p.types.map(t => t.type.name).join(", ")}
📏 Height  : ${p.height / 10} m
⚖️ Weight  : ${p.weight / 10} kg
✨ Ability : ${p.abilities.map(a => a.ability.name).join(", ")}

❤️ HP ${st("hp")}  ⚔️ ATK ${st("attack")}  🛡️ DEF ${st("defense")}
🏃 SPD ${st("speed")}`);
            const img = p.sprites?.other?.["official-artwork"]?.front_default || p.sprites?.front_default;
            if (img) { await context.sock.sendMessage(context.remoteJid, { image: { url: img }, caption: text }, { quoted: context.message }); return null; }
            return text;
        } catch { return commandResponse(`❌ No Pokémon called "${q}".`); }
    }
};
