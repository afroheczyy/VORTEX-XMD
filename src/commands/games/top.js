const { commandResponse } = require("../../utils/branding");
const xp = require("../../services/xp");

module.exports = {
    name: "top", aliases: ["leaderboard", "lb"], category: "games",
    permission: "public", description: "Top 10 chatters in this chat.",
    usage: ".top",
    async execute(context) {
        const list = xp.top(context.remoteJid, 10);
        if (!list.length) return commandResponse("📊 Nobody has XP here yet.");
        const medals = ["🥇", "🥈", "🥉"];
        const rows = list.map((u, i) =>
            `${medals[i] || (i + 1) + "."} ${u.name || u.uid} · Lv ${u.level} · ${u.xp} XP`);
        return commandResponse(`🏆 *LEADERBOARD*\n\n${rows.join("\n")}`);
    }
};
