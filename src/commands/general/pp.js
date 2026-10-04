const { commandResponse } = require("../../utils/branding");
const { getTarget } = require("../../utils/target");
module.exports = {
    name: "pp", aliases: ["avatar", "getpp"], category: "general",
    permission: "public", description: "Get someone's profile picture.",
    usage: ".pp [@user | reply | number]",
    async execute(context) {
        const t = getTarget(context) || context.sender;
        try {
            const url = await context.sock.profilePictureUrl(t, "image");
            await context.sock.sendMessage(context.remoteJid,
                { image: { url }, caption: "🖼️ Profile picture" }, { quoted: context.message });
            return null;
        } catch { return commandResponse("❌ No profile picture found (or it's private)."); }
    }
};
