const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "catfact", aliases: ["catfacts"], category: "fun",
    permission: "public", description: "Random cat fact.",
    usage: ".catfact",
    async execute() {
        try {
            const r = await fetch("https://catfact.ninja/fact", { signal: AbortSignal.timeout(10000) });
            const d = await r.json();
            if (!d.fact) throw new Error();
            return commandResponse(`🐱 *Cat fact*\n\n${d.fact}`);
        } catch { return commandResponse("❌ Couldn't fetch a fact right now."); }
    }
};
