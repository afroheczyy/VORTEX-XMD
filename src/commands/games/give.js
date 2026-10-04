const { commandResponse } = require("../../utils/branding");
const { getTarget } = require("../../utils/target");
const xp = require("../../services/xp");
const eco = require("../../services/economy");

module.exports = {
    name: "give", aliases: ["pay", "send"], category: "games",
    permission: "public", description: "Give coins to someone.",
    usage: ".give @user 50   (or reply to them: .give 50)",
    async execute(context) {
        const t = getTarget(context);
        const amount = parseInt([...(context.args || [])].reverse().find(a => /^\d+$/.test(a)) || "", 10);
        if (!t || !amount || amount < 1)
            return commandResponse("🤝 Usage: .give @user 50\nOr reply to their message with .give 50");
        const from = xp.uidOf(context.message, context.sock);
        const to = xp.clean(t);
        if (from === to) return commandResponse("😅 You can't pay yourself.");
        const u = eco.get(from, context.message?.pushName);
        if (amount > u.coins) return commandResponse(`❌ You only have ${u.coins} coins.`);
        eco.add(from, -amount);
        eco.add(to, amount);
        return commandResponse(`🤝 Sent *${amount}* coins to @${to}\n🪙 Your balance: ${u.coins}`);
    }
};
