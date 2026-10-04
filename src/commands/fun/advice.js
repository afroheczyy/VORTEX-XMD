const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "advice", aliases: ["tip"], category: "fun",
    permission: "public", description: "Get a random piece of advice.",
    usage: ".advice",
    async execute() {
        try {
            const r = await fetch("https://api.adviceslip.com/advice", { signal: AbortSignal.timeout(10000) });
            const d = JSON.parse(await r.text());
            return commandResponse(`🧠 *Advice*\n\n${d.slip.advice}`);
        } catch { return commandResponse("❌ Couldn't fetch advice right now."); }
    }
};
