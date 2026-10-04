const { commandResponse } = require("../../utils/branding");
const xp = require("../../services/xp");

module.exports = {
    name: "daily", aliases: ["claim", "bonus"], category: "games",
    permission: "public", description: "Claim your daily XP bonus.",
    usage: ".daily",
    async execute(context) {
        const uid = xp.uidOf(context.message, context.sock);
        const r = xp.daily(context.remoteJid, uid);
        if (!r.ok) {
            const h = Math.floor(r.wait / 3600000), m = Math.floor((r.wait % 3600000) / 60000);
            return commandResponse(`⏳ Already claimed.\nCome back in ${h}h ${m}m.`);
        }
        return commandResponse(`🎁 *Daily bonus*\n\n+${r.gained} XP\n⭐ Level ${r.level}`);
    }
};
