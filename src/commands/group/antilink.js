const { commandResponse } = require("../../utils/branding");
const { getSettings, setSetting } = require("../../services/protection");

module.exports = {
    name: "antilink",
    aliases: ["antilinks"],
    category: "group",
    permission: "admin",
    description: "Toggle anti-link protection.",
    usage: ".antilink on/off",

    async execute(context) {
        if (!context.isGroup) {
            return commandResponse("❌ Group command only.");
        }

        const value = context.args?.[0]?.toLowerCase();

        if (!["on", "off"].includes(value)) {
            const settings = getSettings(context.remoteJid);

            return commandResponse(
`╭━━━〔 🔗 VORTEX ANTILINK 〕━━━╮
┃
┃  Status : ${settings.antiLink ? "ON 🟢" : "OFF 🔴"}
┃
┃  Usage:
┃  .antilink on
┃  .antilink off
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );
        }

        const enabled = value === "on";

        setSetting(
            context.remoteJid,
            "antiLink",
            enabled
        );

        return commandResponse(
`╭━━━〔 🔗 VORTEX ANTILINK 〕━━━╮
┃
┃  Status : ${enabled ? "ENABLED 🟢" : "DISABLED 🔴"}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
