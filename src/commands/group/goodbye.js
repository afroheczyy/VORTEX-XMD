const {
    getSettings,
    setSetting
} = require("../../services/group/events");

module.exports = {
    name: "goodbye",
    aliases: ["bye"],
    permission: "admin",

    async execute(context) {
        if (!context.isGroup) {
            return {
                text: "❌ This command can only be used in groups."
            };
        }

        const action = String(
            context.args[0] || ""
        ).toLowerCase();

        if (!action) {
            const status = getSettings(context.remoteJid);

            return {
                text:
                    `╭━━━〔 👋 GOODBYE SYSTEM 〕━━━╮\n` +
                    `┃\n` +
                    `┃ Status: ${status.goodbye ? "🟢 ON" : "🔴 OFF"}\n` +
                    `┃\n` +
                    `┃ .goodbye on\n` +
                    `┃ .goodbye off\n` +
                    `┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
            };
        }

        if (action === "on" || action === "enable") {
            setSetting(
                context.remoteJid,
                "goodbye",
                true
            );

            return {
                text:
                    "✅ *GOODBYE SYSTEM ENABLED*\n\n" +
                    "VORTEX will now announce members leaving."
            };
        }

        if (action === "off" || action === "disable") {
            setSetting(
                context.remoteJid,
                "goodbye",
                false
            );

            return {
                text:
                    "🛑 *GOODBYE SYSTEM DISABLED*"
            };
        }

        return {
            text:
                "❌ Use `.goodbye on` or `.goodbye off`."
        };
    }
};
