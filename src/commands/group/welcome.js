const {
    getSettings,
    setSetting
} = require("../../services/group/events");

module.exports = {
    name: "welcome",
    category: "group",
    aliases: ["welcomer"],
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
                    `╭━━━〔 👋 WELCOME SYSTEM 〕━━━╮\n` +
                    `┃\n` +
                    `┃ Status: ${status.welcome ? "🟢 ON" : "🔴 OFF"}\n` +
                    `┃\n` +
                    `┃ .welcome on\n` +
                    `┃ .welcome off\n` +
                    `┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
            };
        }

        if (action === "on" || action === "enable") {
            setSetting(
                context.remoteJid,
                "welcome",
                true
            );

            return {
                text:
                    "✅ *WELCOME SYSTEM ENABLED*\n\n" +
                    "VORTEX will now welcome new members."
            };
        }

        if (action === "off" || action === "disable") {
            setSetting(
                context.remoteJid,
                "welcome",
                false
            );

            return {
                text:
                    "🛑 *WELCOME SYSTEM DISABLED*"
            };
        }

        return {
            text:
                "❌ Use `.welcome on` or `.welcome off`."
        };
    }
};
