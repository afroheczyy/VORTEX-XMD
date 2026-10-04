const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "mock", aliases: ["spongebob"], category: "fun",
    permission: "public", description: "mOcK tExT sTyLe.",
    usage: ".mock I am very smart",
    async execute(context) {
        const t = (context.args || []).join(" ").trim();
        if (!t) return commandResponse("🧽 Usage: .mock I am very smart");
        let i = 0;
        const out = Array.from(t).map(c => /[a-z]/i.test(c) ? (i++ % 2 ? c.toUpperCase() : c.toLowerCase()) : c).join("");
        return commandResponse(`🧽 ${out}`);
    }
};
