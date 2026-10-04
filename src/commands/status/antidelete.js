const antidelete = require("../../services/antidelete");

module.exports = {
    name: "antidelete",

    aliases: [
        "antidel",
        "deleteprotect"
    ],

    description:
        "Detect and recover deleted messages.",

    permission: "owner",

    async execute({ args }) {
        const settings =
            antidelete.getSettings();

        if (!args.length) {
            return {
                text:
                    "╭━━━〔 🗑️ ANTI-DELETE 〕━━━╮\n" +
                    "┃\n" +
                    `┃ Status : ${settings.enabled ? "🟢 ON" : "🔴 OFF"}\n` +
                    "┃\n" +
                    "┣━━〔 CONTROLS 〕━━\n" +
                    "┃ .antidelete on\n" +
                    "┃ .antidelete off\n" +
                    "┃\n" +
                    "╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
            };
        }

        const option =
            args[0].toLowerCase();

        if (
            option !== "on" &&
            option !== "off"
        ) {
            return {
                text:
                    "❌ Use:\n" +
                    ".antidelete on\n" +
                    ".antidelete off"
            };
        }

        const enabled =
            option === "on";

        antidelete.setEnabled(enabled);

        return {
            text:
                "🗑️ *VORTEX ANTI-DELETE*\n\n" +
                `Status : ${enabled ? "🟢 ON" : "🔴 OFF"}`
        };
    }
};
