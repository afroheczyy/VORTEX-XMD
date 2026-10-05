const { commandResponse } = require("../../utils/branding");
const MAP = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
const toRoman = n => { let s = ""; for (const [v, r] of MAP) while (n >= v) { s += r; n -= v; } return s; };
const fromRoman = s => {
    const val = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
    let t = 0;
    for (let i = 0; i < s.length; i++) t += val[s[i]] < (val[s[i + 1]] || 0) ? -val[s[i]] : val[s[i]];
    return t;
};
module.exports = {
    name: "roman", aliases: ["romannumeral"], category: "search",
    permission: "public", description: "Numbers to Roman numerals and back.",
    usage: ".roman 2026   or   .roman MMXXVI",
    async execute(context) {
        const v = (context.args?.[0] || "").trim().toUpperCase();
        if (/^\d+$/.test(v)) {
            const n = parseInt(v, 10);
            if (n < 1 || n > 3999) return commandResponse("❌ Use a number from 1 to 3999.");
            return commandResponse(`🏛️ ${n} = *${toRoman(n)}*`);
        }
        if (/^[IVXLCDM]+$/.test(v)) {
            const n = fromRoman(v);
            return toRoman(n) === v ? commandResponse(`🏛️ ${v} = *${n}*`) : commandResponse("❌ That isn't a valid Roman numeral.");
        }
        return commandResponse("🏛️ Usage: .roman 2026\nor .roman MMXXVI");
    }
};
