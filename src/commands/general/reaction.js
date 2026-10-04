const reaction = require("../../services/reaction");

module.exports = {
    name: "reaction",
    category: "general",

    aliases: [
        "reactcmd",
        "cmdreact"
    ],

    description:
        "Control automatic command reactions.",

    permission: "owner",

    async execute({ args }) {
        const settings =
            reaction.getSettings();

        if (!args.length) {
            return {
                text:
                    "╭━━━〔 ⚡ COMMAND REACTION 〕━━━╮\n" +
                    "┃\n" +
                    `┃ Status : ${settings.enabled ? "🟢 ON" : "🔴 OFF"}\n` +
                    `┃ Emoji  : ${settings.emoji}\n` +
                    "┃\n" +
                    "┣━━〔 CONTROLS 〕━━\n" +
                    "┃ .reaction on\n" +
                    "┃ .reaction off\n" +
                    "┃ .reaction emoji 🔥\n" +
                    "┃\n" +
                    "╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
            };
        }

        const option =
            args[0].toLowerCase();

        if (
            option === "on" ||
            option === "off"
        ) {
            const enabled =
                option === "on";

            reaction.setEnabled(enabled);

            return {
                text:
                    "⚡ *COMMAND REACTION*\n\n" +
                    `Status : ${enabled ? "🟢 ON" : "🔴 OFF"}`
            };
        }

        if (option === "emoji") {
            const emoji =
                args.slice(1).join(" ").trim();

            if (!emoji) {
                return {
                    text:
                        `⚡ Current reaction emoji: ${settings.emoji}`
                };
            }

            const newEmoji =
                reaction.setEmoji(emoji);

            return {
                text:
                    `✅ Command reaction changed to ${newEmoji}`
            };
        }

        return {
            text:
                "❌ Unknown reaction option.\n\n" +
                "Use:\n" +
                ".reaction\n" +
                ".reaction on\n" +
                ".reaction off\n" +
                ".reaction emoji 🔥"
        };
    }
};
