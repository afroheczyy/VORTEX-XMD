const {
    getWarnings,
    addWarning,
    getWarningLimit
} = require("../../services/group");

module.exports = {
    name: "warn",
    aliases: ["warning"],
    permission: "admin",

    async execute(context) {
        const {
            args,
            remoteJid,
            sock,
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
                target = `${target}@s.whatsapp.net`;
            }
        }

        if (!target) {
            return {
                text:
                    "❌ Tag a member to warn.\n\n" +
                    "Example: `.warn @user`"
            };
        }

        // Never allow the bot to warn itself.
        if (target === sock.user?.id) {
            return {
                text:
                    "❌ I cannot warn myself."
            };
        }

        const count =
            addWarning(
                remoteJid,
                target
            );

        const limit =
            getWarningLimit();

        if (count >= limit) {
            try {
                await sock.groupParticipantsUpdate(
                    remoteJid,
                    [target],
                    "remove"
                );

                return {
                    text:
                        `🚨 *WARNING LIMIT REACHED*\n\n` +
                        `@${target.split("@")[0]} has reached ` +
                        `${limit} warnings.\n\n` +
                        `👢 Member removed from the group.`,
                    mentions: [target]
                };
            } catch (error) {
                return {
                    text:
                        `⚠️ Warning limit reached for ` +
                        `@${target.split("@")[0]}, but I could not remove the member.\n\n` +
                        `Error: ${error.message}`,
                    mentions: [target]
                };
            }
        }

        const remaining =
            limit - count;

        return {
            text:
                `⚠️ *WARNING ${count}/${limit}*\n\n` +
                `👤 @${target.split("@")[0]}\n` +
                `Warnings remaining: ${remaining}\n\n` +
                `Please follow the group rules.`,
            mentions: [target]
        };
    }
};
