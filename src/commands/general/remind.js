const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "remind", aliases: ["reminder", "remindme"], category: "general",
    permission: "public", description: "Set a reminder.",
    usage: ".remind 10m take the food off the stove",
    async execute(context) {
        const [when, ...rest] = context.args || [];
        const m = (when || "").match(/^(\d+)(s|m|h)$/i);
        const note = rest.join(" ").trim();
        if (!m || !note) return commandResponse("⏰ Usage: .remind 10m call mom\nUnits: s, m, h (max 24h)");
        const ms = parseInt(m[1]) * { s: 1000, m: 60000, h: 3600000 }[m[2].toLowerCase()];
        if (ms < 1000 || ms > 86400000) return commandResponse("❌ Pick a time between 1s and 24h.");
        const who = context.sender;
        setTimeout(() => {
            context.sock.sendMessage(context.remoteJid, {
                text: `⏰ *Reminder* @${String(who).split("@")[0].split(":")[0]}\n\n${note}`,
                mentions: [who]
            }).catch(() => {});
        }, ms);
        return commandResponse(`✅ I'll remind you in ${when}.\n(Reminders are lost if the bot restarts.)`);
    }
};
