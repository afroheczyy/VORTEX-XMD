const { commandResponse } = require("../../utils/branding");
const xp = require("../../services/xp");

module.exports = {
    name: "xpmode", aliases: ["xpon", "levelsystem"], category: "group",
    permission: "public", description: "Turn the XP and levels system on or off in this group.",
    usage: ".xpmode on | off",
    async execute(context) {
        if (!context.isGroup) return commandResponse("❌ Groups only.");
        if (!context.isOwner && !context.isAdmin) return commandResponse("❌ Only group admins can change this.");
        const a = (context.args?.[0] || "").toLowerCase();
        if (a === "on" || a === "off") xp.setEnabled(context.remoteJid, a === "on");
        const on = xp.enabled(context.remoteJid);
        return commandResponse(`🏆 *XP system*\n\nThis group: *${on ? "ON ✅" : "OFF ❌"}*\n\n${on ? "Members earn XP and get level-up messages." : "Nothing is tracked or announced here."}\n\n.xpmode on | off`);
    }
};
