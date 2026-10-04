const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "choose", aliases: ["pick", "decide"], category: "fun",
    permission: "public", description: "Pick one option for you.",
    usage: ".choose pizza | burger | rice",
    async execute(context) {
        const opts = (context.args || []).join(" ").split(/\||,/).map(s => s.trim()).filter(Boolean);
        if (opts.length < 2) return commandResponse("🤔 Usage: .choose pizza | burger | rice");
        return commandResponse(`🎯 *I choose:*\n\n${opts[Math.floor(Math.random() * opts.length)]}`);
    }
};
