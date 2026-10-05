const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "countdown", aliases: ["daysleft", "until"], category: "search",
    permission: "public", description: "Days left until a date.",
    usage: ".countdown 2026-12-25 Christmas",
    async execute(context) {
        const [raw, ...rest] = context.args || [];
        if (!/^\d{4}-\d{2}-\d{2}$/.test(raw || "")) return commandResponse("⏳ Usage: .countdown 2026-12-25 Christmas");
        const target = new Date(raw + "T00:00:00");
        if (isNaN(target)) return commandResponse("❌ Invalid date.");
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const days = Math.round((target - today) / 86400000);
        const label = rest.join(" ").trim() || raw;
        if (days === 0) return commandResponse(`🎉 *${label}* is today!`);
        if (days < 0) return commandResponse(`⌛ *${label}* was ${-days} day(s) ago.`);
        return commandResponse(`⏳ *${label}*\n\n${days} day(s) left\n(about ${Math.floor(days / 7)} weeks)`);
    }
};
