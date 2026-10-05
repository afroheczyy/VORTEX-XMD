const { commandResponse } = require("../../utils/branding");
const mode = require("../../services/mode");

module.exports = {
    name: "mode", aliases: ["botmode"], category: "owner",
    permission: "owner", description: "Switch the bot between private and public.",
    usage: ".mode private | public",
    async execute(context) {
        const a = (context.args?.[0] || "").toLowerCase();
        if (a === "private" || a === "public") mode.set(a);
        const m = mode.get();
        return commandResponse(
`*⚙️ BOT MODE*

Current : *${m.toUpperCase()}* ${m === "private" ? "🔒" : "🌍"}
${m === "private" ? "Only you can use commands. Everyone else is ignored." : "Everyone can use public commands."}

.mode private | public`);
    }
};
