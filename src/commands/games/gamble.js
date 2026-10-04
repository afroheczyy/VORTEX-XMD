const { commandResponse } = require("../../utils/branding");
const xp = require("../../services/xp");
const eco = require("../../services/economy");

module.exports = {
    name: "gamble", aliases: ["bet"], category: "games",
    permission: "public", description: "Bet coins. 45% chance to double them.",
    usage: ".gamble 50   or   .gamble all",
    async execute(context) {
        const uid = xp.uidOf(context.message, context.sock);
        const u = eco.get(uid, context.message?.pushName);
        const raw = (context.args?.[0] || "").toLowerCase();
        const bet = raw === "all" ? u.coins : parseInt(raw, 10);
        if (!bet || bet < 10) return commandResponse("🎲 Usage: .gamble 50\nMinimum bet is 10 coins.");
        if (bet > u.coins) return commandResponse(`❌ You only have ${u.coins} coins.`);
        const win = Math.random() < 0.45;
        eco.add(uid, win ? bet : -bet);
        return commandResponse(win
            ? `🎉 *You won!* +${bet} coins\n🪙 Balance: ${u.coins}`
            : `💸 *You lost* ${bet} coins\n🪙 Balance: ${u.coins}`);
    }
};
