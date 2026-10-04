const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "calc", aliases: ["calculate", "math"], category: "search",
    permission: "public", description: "Solve a math expression.",
    usage: ".calc 5*(3+2)",
    async execute(context) {
        const expr = (context.args || []).join(" ").replace(/x/gi, "*").replace(/\^/g, "**").trim();
        if (!expr) return commandResponse("🧮 Usage: .calc 25*4+10");
        if (expr.length > 100 || !/^[0-9+\-*/%.()\s]+$/.test(expr))
            return commandResponse("❌ Only numbers and + - * / % ^ ( ) are allowed.");
        try {
            const result = Function(`"use strict"; return (${expr})`)();
            if (!Number.isFinite(result)) throw new Error();
            return commandResponse(`🧮 *${expr}*\n\n= *${result}*`);
        } catch { return commandResponse("❌ Invalid expression."); }
    }
};
