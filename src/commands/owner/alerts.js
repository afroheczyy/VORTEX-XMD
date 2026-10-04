const { commandResponse } = require("../../utils/branding");
const alerts = require("../../services/alerts");

module.exports = {
    name: "alerts", aliases: ["notify"], category: "owner",
    permission: "owner", description: "DM me when the bot reconnects or crashes.",
    usage: ".alerts on|off",
    async execute(context) {
        const a = (context.args?.[0] || "").toLowerCase();
        if (a === "on" || a === "off") alerts.setEnabled(a === "on");
        return commandResponse(`🔔 Alerts: *${alerts.enabled() ? "ON" : "OFF"}*\nYou get a DM when the bot comes online, reconnects, or restarts after a crash.`);
    }
};
