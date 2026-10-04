const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "leave", aliases: ["leavegroup"], category: "owner",
    permission: "owner", description: "Make the bot leave this group.",
    usage: ".leave",
    async execute(context) {
        if (!context.isGroup) return commandResponse("❌ Use this inside a group.");
        await context.sock.sendMessage(context.remoteJid,
            { text: commandResponse("👋 VORTEX is leaving. Goodbye!") });
        setTimeout(() => context.sock.groupLeave(context.remoteJid).catch(() => {}), 1500);
        return null;
    }
};
