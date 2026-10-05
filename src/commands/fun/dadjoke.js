const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "dadjoke", aliases: ["dad"], category: "fun",
    permission: "public", description: "Random dad joke.",
    usage: ".dadjoke",
    async execute() {
        try {
            const r = await fetch("https://icanhazdadjoke.com/", {
                headers: { Accept: "application/json", "User-Agent": "VortexBot" },
                signal: AbortSignal.timeout(10000)
            });
            const d = await r.json();
            if (!d.joke) throw new Error();
            return commandResponse(`😄 *Dad joke*\n\n${d.joke}`);
        } catch { return commandResponse("❌ No joke right now. Try again."); }
    }
};
