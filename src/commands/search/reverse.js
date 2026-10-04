const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "reverse", aliases: ["rev"], category: "search",
    permission: "public", description: "Reverse your text.",
    usage: ".reverse <text>",
    async execute(context) {
        const t = (context.args || []).join(" ").trim();
        if (!t) return commandResponse("🔁 Usage: .reverse hello");
        return commandResponse(`🔁 ${Array.from(t).reverse().join("")}`);
    }
};
