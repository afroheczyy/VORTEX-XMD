const { commandResponse } = require("../../utils/branding");
const E = ["🍒", "🍋", "🍇", "🔔", "💎", "7️⃣"];
module.exports = {
    name: "slot", aliases: ["slots", "spin"], category: "games",
    permission: "public", description: "Spin the slot machine.",
    usage: ".slot",
    async execute() {
        const r = () => E[Math.floor(Math.random() * E.length)];
        const [a, b, c] = [r(), r(), r()];
        const res = a === b && b === c ? "🎉 *JACKPOT!*"
            : a === b || b === c || a === c ? "✨ Two match, small win!" : "😢 No luck, try again.";
        return commandResponse(`🎰 *SLOTS*\n\n[ ${a} | ${b} | ${c} ]\n\n${res}`);
    }
};
