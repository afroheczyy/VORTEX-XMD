const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "setbio", aliases: ["bio"], category: "owner", permission: "owner",
    description: "Change the bot's About text.", usage: ".setbio <text>",
    async execute(context) {
        const text = (context.args || []).join(" ").trim();
        if (!text) return commandResponse("✏️ Usage: .setbio VORTEX XMD online 🌀");
        try {
            await context.sock.updateProfileStatus(text.slice(0, 139));
            return commandResponse("✅ Bio updated.");
        } catch { return commandResponse("❌ Couldn't update the bio."); }
    }
};
