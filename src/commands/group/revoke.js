const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "revoke", aliases: ["resetlink", "newlink"], category: "group",
    permission: "admin", description: "Reset the group invite link.",
    usage: ".revoke",
    async execute(context) {
        if (!context.isGroup) return commandResponse("❌ Groups only.");
        try {
            const code = await context.sock.groupRevokeInvite(context.remoteJid);
            return commandResponse(`♻️ *Link reset*\n\nNew link:\nhttps://chat.whatsapp.com/${code}`);
        } catch { return commandResponse("❌ I need to be a group admin to do that."); }
    }
};
