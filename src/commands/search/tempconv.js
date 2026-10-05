const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "tempconv", aliases: ["ctof", "ftoc", "celsius", "fahrenheit"], category: "search",
    permission: "public", description: "Convert Celsius and Fahrenheit.",
    usage: ".tempconv 30 c   or   .tempconv 86 f",
    async execute(context) {
        const n = parseFloat(context.args?.[0]);
        const u = (context.args?.[1] || "c").toLowerCase()[0];
        if (isNaN(n) || !["c", "f"].includes(u)) return commandResponse("🌡️ Usage: .tempconv 30 c\nor .tempconv 86 f");
        const out = u === "c" ? n * 9 / 5 + 32 : (n - 32) * 5 / 9;
        return commandResponse(`🌡️ ${n}°${u.toUpperCase()} = *${out.toFixed(1)}°${u === "c" ? "F" : "C"}*`);
    }
};
