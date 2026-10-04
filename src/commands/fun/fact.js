const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "fact", aliases: ["randomfact"], category: "fun",
    permission: "public", description: "Get a random fact.",
    usage: ".fact",
    async execute() {
        try {
            const r = await fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en",
                { signal: AbortSignal.timeout(10000) });
            const d = await r.json();
            return commandResponse(`🧠 *Did you know?*\n\n${d.text}`);
        } catch { return commandResponse("❌ Couldn't fetch a fact right now."); }
    }
};
