const crypto = require("crypto");
const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "ship", aliases: ["love", "match"], category: "fun",
    permission: "public", description: "Love compatibility between two names.",
    usage: ".ship Ama & Kofi",
    async execute(context) {
        const parts = (context.args || []).join(" ").split(/&|\band\b|\+/i).map(s => s.trim()).filter(Boolean);
        if (parts.length < 2) return commandResponse("💘 Usage: .ship Ama & Kofi");
        const [a, b] = parts.slice(0, 2);
        const key = [a, b].map(x => x.toLowerCase()).sort().join("|");
        const pct = crypto.createHash("md5").update(key).digest()[0] % 101;
        const bar = "█".repeat(Math.round(pct / 10)) + "░".repeat(10 - Math.round(pct / 10));
        const verdict = pct > 80 ? "Soulmates 💍" : pct > 50 ? "Good vibes 😍" : pct > 25 ? "Just friends 🙂" : "Not it 💔";
        return commandResponse(`💘 *Love Meter*\n\n${a} ❤️ ${b}\n[${bar}] *${pct}%*\n${verdict}`);
    }
};
