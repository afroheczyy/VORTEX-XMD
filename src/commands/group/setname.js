const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "setname", aliases: ["gname"], category: "group",
    permission: "admin", description: "Change the group name.",
    usage: ".setname <new name>",
    async execute(context) {
        if (!context.isGroup) return commandResponse("❌ Groups only.");
        const name = (context.args || []).join(" ").trim();
        if (!name) return commandResponse("✏️ Usage: .setname New Group Name");
        try {
            await context.sock.groupUpdateSubject(context.remoteJid, name.slice(0, 100));
            return commandResponse(`✅ Group name changed to *${name.slice(0, 100)}*`);
        } catch { return commandResponse("❌ I need to be a group admin to do that."); }
    }
};
