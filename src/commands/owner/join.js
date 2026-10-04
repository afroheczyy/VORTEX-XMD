const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "join", aliases: ["joingroup"], category: "owner",
    permission: "owner", description: "Make the bot join a group via link.",
    usage: ".join https://chat.whatsapp.com/XXXX",
    async execute(context) {
        const m = (context.args?.[0] || "").match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/);
        if (!m) return commandResponse("➕ Usage: .join https://chat.whatsapp.com/XXXX");
        try {
            await context.sock.groupAcceptInvite(m[1]);
            return commandResponse("✅ Joined the group.");
        } catch { return commandResponse("❌ Couldn't join. The link may be expired or full."); }
    }
};
