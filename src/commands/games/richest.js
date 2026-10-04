const { commandResponse } = require("../../utils/branding");
const eco = require("../../services/economy");

module.exports = {
    name: "richest", aliases: ["rich", "wealth"], category: "games",
    permission: "public", description: "Top 10 richest players.",
    usage: ".richest",
    async execute() {
        const list = eco.richest(10);
        if (!list.length) return commandResponse("💰 Nobody has coins yet. Try .work");
        const medals = ["🥇", "🥈", "🥉"];
        const rows = list.map((u, i) => `${medals[i] || (i + 1) + "."} ${u.name || u.uid} · ${u.coins} 🪙`);
        return commandResponse(`💰 *RICHEST PLAYERS*\n\n${rows.join("\n")}`);
    }
};
