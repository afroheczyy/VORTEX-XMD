const fs = require("fs");
const path = require("path");

const automation = require("../../services/automation");

const SETTINGS_FILE = path.resolve(
    __dirname,
    "../../../database/automation.json"
);

module.exports = {
    name: "automation",
    category: "status",
    aliases: [
        "auto",
        "autostatus"
    ],

    description:
        "VORTEX automation controls",

    permission: "owner",

    async execute({ args }) {
        const settings =
            automation.getSettings();

        if (!args.length) {
            return {
                text:
                    "╭━━━〔 🌀 VORTEX AUTOMATION 〕━━━╮\n" +
                    "┃\n" +
                    `┃ 👀 Auto View      : ${settings.autoView ? "🟢 ON" : "🔴 OFF"}\n` +
                    `┃ ❤️ Auto React     : ${settings.autoReact ? "🟢 ON" : "🔴 OFF"}\n` +
                    `┃ 💾 Auto Save      : ${settings.autoSave ? "🟢 ON" : "🔴 OFF"}\n` +
                    `┃ ⌨️ Auto Typing     : ${settings.autoTyping ? "🟢 ON" : "🔴 OFF"}\n` +
                    `┃ 🎙️ Auto Recording  : ${settings.autoRecording ? "🟢 ON" : "🔴 OFF"}\n` +
                    `┃ ⌨️🎙️ Type/Record    : ${settings.autoTypeRecord ? "🟢 ON" : "🔴 OFF"}\n` +
                    `┃ ❤️ Emoji           : ${settings.reactEmoji}\n` +
                    "┃\n" +
                    "┣━━〔 CONTROLS 〕━━\n" +
                    "┃ .automation view on/off\n" +
                    "┃ .automation react on/off\n" +
                    "┃ .automation save on/off\n" +
                    "┃ .automation typing on/off\n" +
                    "┃ .automation recording on/off\n" +
                    "┃ .automation typerecord on/off\n" +
                    "┃ .automation emoji ❤️\n" +
                    "┃\n" +
                    "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
            };
        }

        const option =
            args[0].toLowerCase();

        const value =
            args[1]?.toLowerCase();

        const map = {
            view: "autoView",
            react: "autoReact",
            save: "autoSave",
            typing: "autoTyping",
            recording: "autoRecording",
            typerecord: "autoTypeRecord"
        };

        if (option === "emoji") {
            const emoji =
                args.slice(1).join(" ");

            if (!emoji) {
                return {
                    text:
                        `❤️ Current emoji: ${settings.reactEmoji}`
                };
            }

            settings.reactEmoji = emoji;

            fs.mkdirSync(
                path.dirname(SETTINGS_FILE),
                { recursive: true }
            );

            fs.writeFileSync(
                SETTINGS_FILE,
                JSON.stringify(
                    settings,
                    null,
                    2
                )
            );

            return {
                text:
                    `✅ Auto-react emoji changed to ${emoji}`
            };
        }

        if (!map[option]) {
            return {
                text:
                    "❌ Unknown automation option.\n\n" +
                    "Use .automation to see controls."
            };
        }

        if (
            value !== "on" &&
            value !== "off"
        ) {
            return {
                text:
                    `❌ Correct usage:\n` +
                    `.automation ${option} on\n` +
                    `.automation ${option} off`
            };
        }

        automation.setSetting(
            map[option],
            value === "on"
        );

        return {
            text:
                "🌀 *VORTEX AUTOMATION*\n\n" +
                `Feature : ${option}\n` +
                `Status  : ${value === "on" ? "🟢 ON" : "🔴 OFF"}`
        };
    }
};
