const {
    getWarnings
} = require("../../services/group");

module.exports = {
    name: "warnings",
    aliases: ["warns"],
    permission: "admin",

    async execute(context) {
        const {
            args,
            remoteJid,
            message
        } = context;

        if (!context.isGroup) {
            return {
                text:
                    "❌ This command can only be used in groups."
            };
        }

        const mentioned =
            message?.message
                ?.extendedTextMessage
                ?.contextInfo
                ?.mentionedJid || [];

        let target = mentioned[0];

        if (!target && args[0]) {
            target = args[0]
                .replace(/[^\d]/g, "");

            if (target) {
                target =
                    `${target}@s.whatsapp.net`;
            }
        }

        if (!target) {
            return {
                text:
                    "❌ Tag a member.\n\n" +
                    "Example: `.warnings @user`"
            };
        }

        const count =
            getWarnings(
                remoteJid,
                target
            );

        return {
            text:
                `⚠️ *WARNING STATUS*\n\n` +
                `👤 @${target.split("@")[0]}\n` +
                `Warnings: ${count}/3`,
            mentions: [target]
        };
    }
};
