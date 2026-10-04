const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "groupstats", aliases: ["gstats", "gcinfo"], category: "group",
    permission: "public", description: "Quick numbers about this group.",
    usage: ".groupstats",
    async execute(context) {
        if (!context.isGroup) return commandResponse("❌ Groups only.");
        try {
            const m = await context.sock.groupMetadata(context.remoteJid);
            const admins = m.participants.filter(p => p.admin).length;
            const created = m.creation ? new Date(m.creation * 1000).toDateString() : "Unknown";
            return commandResponse(
`*📊 ${m.subject}*

👥 Members : ${m.participants.length}
👑 Admins  : ${admins}
🙂 Others  : ${m.participants.length - admins}
📅 Created : ${created}
🔒 Announce: ${m.announce ? "Admins only" : "Everyone can send"}
${m.desc ? "\n📝 " + String(m.desc).slice(0, 200) : ""}`);
        } catch { return commandResponse("❌ Couldn't read this group."); }
    }
};
