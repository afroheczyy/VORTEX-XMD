const { commandResponse } = require("../../utils/branding");
const { getTarget } = require("../../utils/target");
const xp = require("../../services/xp");
const eco = require("../../services/economy");

module.exports = {
    name: "wallet", aliases: ["balance", "bal", "coins"], category: "games",
    permission: "public", description: "Check your coin balance.",
    usage: ".wallet [@user | reply]",
    async execute(context) {
        const t = getTarget(context);
        const uid = t ? xp.clean(t) : xp.uidOf(context.message, context.sock);
        const u = eco.get(uid, t ? "" : context.message?.pushName);
        return commandResponse(`💰 *WALLET*\n\n👤 ${u.name || uid}\n🪙 Coins: *${u.coins}*\n\nEarn more: .work · .gamble <amount>`);
    }
};
