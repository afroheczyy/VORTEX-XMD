const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "link", aliases: ["grouplink", "gclink"], category: "group",
    permission: "admin", description: "Get the group invite link.",
    usage: ".link",
    async execute(context) {
        if (!context.isGroup) return commandResponse("❌ Groups only.");
        try {
            const code = await context.sock.groupInviteCode(context.remoteJid);
            return commandResponse(`🔗 *Group Link*\n\nhttps://chat.whatsapp.com/${code}`);
        } catch { return commandResponse("❌ I need to be a group admin to do that."); }
    }
};
