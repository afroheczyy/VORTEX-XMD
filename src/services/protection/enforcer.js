const {
    getSettings,
    hasLink,
    isSpam,
    containsBadword
} = require("./index");

async function deleteMessage(sock, groupJid, message) {
    try {
        await sock.sendMessage(groupJid, {
            delete: message.key
        });

        return true;
    } catch (error) {
        console.log(
            `[VORTEX] Message delete failed: ${error.message}`
        );

        return false;
    }
}

async function enforceProtection(
    sock,
    message,
    context,
    text
) {
    if (!context.isGroup) return false;
    if (!text) return false;

    // Never interfere with VORTEX commands.
    if (text.startsWith(context.prefix || ".")) {
        return false;
    }

    // Owner and group admins are exempt.
    if (context.isOwner || context.isAdmin) {
        return false;
    }

    const groupJid = context.remoteJid;
    const sender = context.sender || "unknown";

    const protection =
        getSettings(groupJid);

    // ─────────────── ANTI-LINK ───────────────
    if (
        protection.antiLink &&
        hasLink(text)
    ) {
        await deleteMessage(
            sock,
            groupJid,
            message
        );

        await sock.sendMessage(groupJid, {
            text:
                "🚫 *ANTI-LINK*\n\n" +
                "Links are not allowed in this group.\n" +
                "Message removed."
        });

        console.log(
            `[VORTEX] Anti-link blocked ${sender}`
        );

        return true;
    }

    // ─────────────── ANTI-SPAM ───────────────
    if (
        protection.antiSpam &&
        isSpam(groupJid, sender)
    ) {
        await deleteMessage(
            sock,
            groupJid,
            message
        );

        await sock.sendMessage(groupJid, {
            text:
                "⚠️ *ANTI-SPAM*\n\n" +
                "Please slow down.\n" +
                "Spam messages are being blocked."
        });

        console.log(
            `[VORTEX] Anti-spam blocked ${sender}`
        );

        return true;
    }

    // ─────────────── BADWORD ───────────────
    if (
        protection.badword &&
        containsBadword(text, groupJid)
    ) {
        await deleteMessage(
            sock,
            groupJid,
            message
        );

        await sock.sendMessage(groupJid, {
            text:
                "🚫 *BADWORD FILTER*\n\n" +
                "That message contains a blocked word.\n" +
                "Message removed."
        });

        console.log(
            `[VORTEX] Badword blocked ${sender}`
        );

        return true;
    }

    return false;
}

module.exports = {
    enforceProtection
};
