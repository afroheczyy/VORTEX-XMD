const {
    getSettings,
    setSetting,
    getBadwords,
    addBadword,
    removeBadword
} = require("../../services/protection");

module.exports = {
    name: "badword",
    category: "group",
    aliases: ["badwords", "wordfilter"],
    permission: "admin",

    async execute(context) {
        const { args, remoteJid, sock, message } = context;

        if (!context.isGroup) {
            return {
                text: "❌ This command can only be used in groups."
            };
        }

        const action = String(args[0] || "")
            .toLowerCase();

        if (!action) {
            return {
                text:
                    "╭━━━〔 🚫 BADWORD FILTER 〕━━━╮\n" +
                    "┃\n" +
                    "┃ .badword on\n" +
                    "┃ .badword off\n" +
                    "┃ .badword add <word>\n" +
                    "┃ .badword del <word>\n" +
                    "┃ .badword list\n" +
                    "┃\n" +
                    "╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
            };
        }

        if (action === "on" || action === "enable") {
            setSetting(
                remoteJid,
                "badword",
                true
            );

            return {
                text:
                    "✅ *BADWORD FILTER ENABLED*\n\n" +
                    "Blocked words will now be removed automatically."
            };
        }

        if (action === "off" || action === "disable") {
            setSetting(
                remoteJid,
                "badword",
                false
            );

            return {
                text:
                    "🛑 *BADWORD FILTER DISABLED*"
            };
        }

        if (action === "add") {
            const word = args
                .slice(1)
                .join(" ")
                .trim();

            if (!word) {
                return {
                    text:
                        "❌ Usage:\n" +
                        ".badword add <word>"
                };
            }

            const added =
                addBadword(
                    remoteJid,
                    word
                );

            return {
                text: added
                    ? `✅ Added "${word}" to the blocked-word list.`
                    : `⚠️ "${word}" is already blocked.`
            };
        }

        if (
            action === "del" ||
            action === "delete" ||
            action === "remove"
        ) {
            const word = args
                .slice(1)
                .join(" ")
                .trim();

            if (!word) {
                return {
                    text:
                        "❌ Usage:\n" +
                        ".badword del <word>"
                };
            }

            const removed =
                removeBadword(
                    remoteJid,
                    word
                );

            return {
                text: removed
                    ? `✅ Removed "${word}" from the blocked-word list.`
                    : `⚠️ "${word}" was not found.`
            };
        }

        if (
            action === "list" ||
            action === "show"
        ) {
            const words =
                getBadwords(remoteJid);

            const status =
                getSettings(remoteJid).badword
                    ? "ON 🟢"
                    : "OFF 🔴";

            if (!words.length) {
                return {
                    text:
                        `🚫 *BADWORD FILTER*\n\n` +
                        `Status: ${status}\n` +
                        `Blocked words: None`
                };
            }

            return {
                text:
                    `🚫 *BADWORD FILTER*\n\n` +
                    `Status: ${status}\n\n` +
                    words
                        .map(
                            (word, index) =>
                                `${index + 1}. ${word}`
                        )
                        .join("\n")
            };
        }

        return {
            text:
                "❌ Unknown option.\n\n" +
                "Use `.badword` to see the commands."
        };
    }
};
