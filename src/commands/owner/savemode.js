const { commandResponse } = require("../../utils/branding");
const saver = require("../../services/saver");
module.exports = {
    name: "savemode", aliases: ["autosave", "vvmode"], category: "owner",
    permission: "owner", description: "Emoji reply/react saves view-once and statuses to your DM.",
    usage: ".savemode on|off",
    async execute(context) {
        const a = (context.args?.[0] || "").toLowerCase();
        if (a === "on" || a === "off") saver.setEnabled(a === "on");
        return commandResponse(`👁️ Emoji save: *${saver.enabled() ? "ON" : "OFF"}*\nReply or react with any emoji to a view-once or status.`);
    }
};
