const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "restart", aliases: ["reboot"], category: "owner", permission: "owner",
    description: "Restart the bot.", usage: ".restart",
    async execute(context) {
        await context.sock.sendMessage(context.remoteJid,
            { text: commandResponse("🔄 Restarting VORTEX...") }, { quoted: context.message });
        setTimeout(() => process.exit(0), 1500);
        return null;
    }
};
