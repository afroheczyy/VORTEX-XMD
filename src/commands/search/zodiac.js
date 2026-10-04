const { commandResponse } = require("../../utils/branding");
const S = [
    ["Capricorn ♑", 1, 19], ["Aquarius ♒", 2, 18], ["Pisces ♓", 3, 20], ["Aries ♈", 4, 19],
    ["Taurus ♉", 5, 20], ["Gemini ♊", 6, 20], ["Cancer ♋", 7, 22], ["Leo ♌", 8, 22],
    ["Virgo ♍", 9, 22], ["Libra ♎", 10, 22], ["Scorpio ♏", 11, 21], ["Sagittarius ♐", 12, 21]
];
module.exports = {
    name: "zodiac", aliases: ["starsign", "sign"], category: "search",
    permission: "public", description: "Find a zodiac sign from a birthday.",
    usage: ".zodiac 05-14",
    async execute(context) {
        const m = (context.args?.[0] || "").match(/^(\d{1,2})[-\/](\d{1,2})$/);
        if (!m) return commandResponse("♈ Usage: .zodiac 05-14\n(month-day)");
        const mo = +m[1], d = +m[2];
        if (mo < 1 || mo > 12 || d < 1 || d > 31) return commandResponse("❌ Invalid date.");
        let sign = "Capricorn ♑";
        for (const [n, sm, sd] of S) if (mo < sm || (mo === sm && d <= sd)) { sign = n; break; }
        if (mo === 12 && d > 21) sign = "Capricorn ♑";
        return commandResponse(`🔮 *Zodiac*\n\nBorn ${mo}/${d}: *${sign}*`);
    }
};
