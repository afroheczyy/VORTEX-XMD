const { commandResponse } = require("../../utils/branding");
const { getTarget } = require("../../utils/target");
const xp = require("../../services/xp");

module.exports = {
    name: "rank", aliases: ["level", "xp", "profile"], category: "games",
    permission: "public", description: "Show your level and XP in this chat.",
    usage: ".rank [@user | reply]",
    async execute(context) {
        const t = getTarget(context);
        const uid = t ? xp.clean(t) : xp.uidOf(context.message, context.sock);
        const r = xp.stats(context.remoteJid, uid);
        if (!r) return commandResponse("📊 No XP yet. Chat a bit and try again.");
        const pct = Math.min(1, (r.xp - r.from) / (r.to - r.from));
        const bar = "█".repeat(Math.round(pct * 10)) + "░".repeat(10 - Math.round(pct * 10));
        return commandResponse(
`🏆 *${r.name || r.uid}*

🏅 Rank    : ${r.title}
⭐ Level   : ${r.level}
✨ XP      : ${r.xp}
📈 [${bar}] ${r.xp}/${r.to}
💬 Messages: ${r.msgs}
🥇 Position: #${r.pos} of ${r.total}`);
    }
};
