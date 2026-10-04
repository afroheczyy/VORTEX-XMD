const { parseMessage } = require("../core/messageParser");
const { executeCommand } = require("../core/commandExecutor");
const { isOwner } = require("../core/permissions");
const config = require("../../config/config");
const { loadCommands } = require("../core/commandLoader");
const { enforceProtection } = require("../services/protection/enforcer");

const {
    handlePresence,
    clearPresence
} = require("../services/automation");

const {
    reactToCommand
} = require("../services/reaction");

let initialized = false;

function initializeCommands() {
    if (initialized) return;

    const count = loadCommands();

    console.log(`[VORTEX] ${count} commands loaded`);

    initialized = true;
}

function getSenderCandidates(message, sock) {
    const key = message?.key || {};

    const list = [
        key.participantAlt,
        key.participant,
        key.remoteJidAlt,
        key.remoteJid
    ];

    if (key.fromMe && sock?.user) {
        list.unshift(sock.user.id, sock.user.lid);
    }

    return list.filter(j => j && !String(j).endsWith("@g.us"));
}

function getText(message) {
    const content = message?.message;

    if (!content) return "";

    return (
        content.conversation ||
        content.extendedTextMessage?.text ||
        content.imageMessage?.caption ||
        content.videoMessage?.caption ||
        content.documentMessage?.caption ||
        ""
    );
}

function cleanJid(value) {
    if (!value) return "";

    return String(value)
        .replace(/:\d+(?=@)/, "")
        .toLowerCase();
}

function sameJid(a, b) {
    return cleanJid(a) === cleanJid(b);
}

async function checkGroupAdmin(
    sock,
    message,
    candidates,
    isGroup
) {
    if (!isGroup) return false;

    try {
        const remoteJid = message?.key?.remoteJid;

        if (!remoteJid) return false;

        const metadata = await sock.groupMetadata(remoteJid);
        const participants = metadata?.participants || [];

        return participants.some(participant => {
            if (!participant?.admin) return false;

            const participantIds = [
                participant.id,
                participant.jid,
                participant.lid,
                participant.phoneNumber,
                participant.alt
            ].filter(Boolean);

            return candidates.some(candidate =>
                participantIds.some(id =>
                    sameJid(candidate, id)
                )
            );
        });
    } catch (error) {
        console.log(
            `[VORTEX] Admin check failed: ${error.message}`
        );

        return false;
    }
}

async function handleMessage(sock, message) {
    initializeCommands();

    const text = getText(message);

    if (!text) return false;

    const candidates = getSenderCandidates(message, sock);
    const sender = candidates[0] || "";
    const remoteJid = message?.key?.remoteJid || "";
    const isGroup = remoteJid.endsWith("@g.us");
    const ownerNumber = config.owner.number;

    const ownerMatched =
        candidates.some(candidate =>
            isOwner(candidate, ownerNumber)
        );

    const isAdmin =
        await checkGroupAdmin(
            sock,
            message,
            candidates,
            isGroup
        );

    const context = {
        sock,
        message,
        sender,
        remoteJid,
        isGroup,
        isOwner: ownerMatched,
        isAdmin,
        isVip: false,
        args: [],
        prefix: config.bot.prefix
    };

    const blocked = await enforceProtection(
        sock,
        message,
        context,
        text
    );

    if (blocked) {
        return true;
    }

    const parsed = parseMessage(text);

    if (!parsed) {
        try {
            await require("../services/chatbot").handle(sock, message, text);
        } catch (e) {
            console.log("[VORTEX] Chatbot hook error: " + e.message);
        }
        return false;
    }

    context.args = parsed.args;

    console.log("");

    console.log(
        "╭━━━〔 🌀 VORTEX COMMAND 〕━━━╮"
    );

    console.log(
        `┃ Command : ${parsed.command}`
    );

    console.log(
        `┃ Type    : ${isGroup ? "GROUP" : "DM"}`
    );

    console.log(
        `┃ Sender  : ${sender}`
    );

    console.log(
        `┃ Owner   : ${ownerMatched ? "YES" : "NO"}`
    );

    console.log(
        `┃ Admin   : ${isAdmin ? "YES" : "NO"}`
    );

    console.log(
        "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
    );

    /*
     * Execute first so unknown commands do not
     * trigger typing/reaction behavior.
     */
    const result =
        await executeCommand(
            parsed,
            context
        );

    if (!result.handled) {
        console.log(
            `[VORTEX] Unknown command: ${parsed.command}`
        );

        return false;
    }

    /*
     * React only to recognized commands.
     */
    await reactToCommand(
        sock,
        message
    );

    /*
     * Start WhatsApp presence before sending
     * the command response.
     */
    await handlePresence(
        sock,
        remoteJid,
        "typing"
    );

    if (!result.success) {
        const errorText =
            result.message ||
            "❌ Command execution failed.";

        await sock.sendMessage(
            remoteJid,
            { text: errorText },
            { quoted: message }
        );

        await clearPresence(
            sock,
            remoteJid
        );

        return true;
    }

    if (result.result) {
        if (
            typeof result.result === "object" &&
            result.result.text
        ) {
            await sock.sendMessage(
                remoteJid,
                result.result,
                { quoted: message }
            );
        } else {
            await sock.sendMessage(
                remoteJid,
                {
                    text: String(result.result)
                },
                { quoted: message }
            );
        }
    }

    await clearPresence(
        sock,
        remoteJid
    );

    console.log(
        `[VORTEX] ${parsed.command} completed in ${result.duration}ms`
    );

    return true;
}

module.exports = {
    initializeCommands,
    handleMessage
};
