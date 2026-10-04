const { commandResponse } = require("../../utils/branding");
const { getSettings, setSetting } = require("../../services/protection");

module.exports = {
    name: "antispam",
    aliases: ["spamguard"],
    category: "group",
    permission: "admin",
    description: "Toggle anti-spam protection.",
    usage: ".antispam on/off",

    async execute(context) {
        if (!context.isGroup) {
            return commandResponse("❌ Group command only.");
        }

        const value = context.args?.[0]?.toLowerCase();

        if (!["on", "off"].includes(value)) {
            const settings = getSettings(context.remoteJid);

            return commandResponse(
`╭━━━〔 🛡️ VORTEX ANTISPAM 〕━━━╮
┃
┃  Status : ${settings.antiSpam ? "ON 🟢" : "OFF 🔴"}
┃
┃  Usage:
┃  .antispam on
┃  .antispam off
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }

        const enabled = value === "on";

        setSetting(
            context.remoteJid,
            "antiSpam",
            enabled
        );

        return commandResponse(
`╭━━━〔 🛡️ VORTEX ANTISPAM 〕━━━╮
┃
┃  Status : ${enabled ? "ENABLED 🟢" : "DISABLED 🔴"}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
