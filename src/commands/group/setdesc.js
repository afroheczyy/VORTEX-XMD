const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "setdesc", aliases: ["gdesc"], category: "group",
    permission: "admin", description: "Change the group description.",
    usage: ".setdesc <text>",
    async execute(context) {
        if (!context.isGroup) return commandResponse("❌ Groups only.");
        const text = (context.args || []).join(" ").trim();
        if (!text) return commandResponse("✏️ Usage: .setdesc Welcome to the group");
        try {
            await context.sock.groupUpdateDescription(context.remoteJid, text);
            return commandResponse("✅ Group description updated.");
        } catch { return commandResponse("❌ I need to be a group admin to do that."); }
    }
};
