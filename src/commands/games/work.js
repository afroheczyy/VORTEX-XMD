const { commandResponse } = require("../../utils/branding");
const xp = require("../../services/xp");
const eco = require("../../services/economy");

const JOBS = ["sold roasted plantain", "fixed phones", "drove a trotro", "washed cars", "tutored students",
    "designed a logo", "delivered packages", "cooked jollof for a party", "edited videos", "repaired a generator"];

module.exports = {
    name: "work", aliases: ["job", "earn"], category: "games",
    permission: "public", description: "Work a job for coins (once an hour).",
    usage: ".work",
    async execute(context) {
        const uid = xp.uidOf(context.message, context.sock);
        const u = eco.get(uid, context.message?.pushName);
        const wait = 3600000 - (Date.now() - u.lastWork);
        if (wait > 0) return commandResponse(`⏳ You are tired. Rest for ${Math.ceil(wait / 60000)} min.`);
        const pay = 40 + Math.floor(Math.random() * 111);
        u.lastWork = Date.now();
        eco.add(uid, pay);
        return commandResponse(`💼 You ${JOBS[Math.floor(Math.random() * JOBS.length)]} and earned *${pay}* coins.\n🪙 Balance: ${u.coins}`);
    }
};
