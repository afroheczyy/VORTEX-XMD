const {
    resetWarnings
} = require("../../services/group");

module.exports = {
    name: "resetwarn",
    aliases: ["resetwarnings"],
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
                    "Example: `.resetwarn @user`"
            };
        }

        resetWarnings(
            remoteJid,
            target
        );

        return {
            text:
                `✅ Warnings reset for @${target.split("@")[0]}.`,
            mentions: [target]
        };
    }
};
