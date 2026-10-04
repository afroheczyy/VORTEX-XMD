const fs = require("fs");
const path = require("path");

const SETTINGS_FILE = path.resolve(
    __dirname,
    "../../../database/antidelete.json"
);

const defaults = {
    enabled: false
};

const messageCache = new Map();

function loadSettings() {
    try {
        if (!fs.existsSync(SETTINGS_FILE)) {
            saveSettings(defaults);
            return { ...defaults };
        }

        const data = JSON.parse(
            fs.readFileSync(SETTINGS_FILE, "utf8")
        );

        return {
            ...defaults,
            ...data
        };
    } catch {
        return { ...defaults };
    }
}

function saveSettings(settings) {
    fs.mkdirSync(
        path.dirname(SETTINGS_FILE),
        { recursive: true }
    );

    fs.writeFileSync(
        SETTINGS_FILE,
        JSON.stringify(settings, null, 2)
    );
}

function getSettings() {
    return loadSettings();
}

function setEnabled(value) {
    const settings = loadSettings();

    settings.enabled = Boolean(value);

    saveSettings(settings);

    return settings.enabled;
}

function cacheMessage(message) {
    if (!message?.key?.id) return;

    const key = message.key.id;

    messageCache.set(key, message);

    // Keep memory under control.
    if (messageCache.size > 1000) {
        const firstKey =
            messageCache.keys().next().value;

        if (firstKey) {
            messageCache.delete(firstKey);
        }
    }
}

function getCachedMessage(id) {
    if (!id) return null;

    return messageCache.get(id) || null;
}

function deleteCachedMessage(id) {
    if (!id) return;

    messageCache.delete(id);
}

function getSender(message) {
    return (
        message?.key?.participantAlt ||
        message?.key?.participant ||
        message?.key?.remoteJidAlt ||
        message?.key?.remoteJid ||
        "Unknown"
    );
}

function extractText(message) {
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

async function handleDelete(sock, update) {
    try {
        if (!loadSettings().enabled) {
            return false;
        }

        const protocolMessage =
            update?.update?.message?.protocolMessage;

        if (!protocolMessage) {
            return false;
        }

        const type =
            protocolMessage.type;

        // 0 = REVOKE in Baileys.
        if (type !== 0) {
            return false;
        }

        const deletedKey =
            protocolMessage.key;

        if (!deletedKey?.id) {
            return false;
        }

        const cached =
            getCachedMessage(deletedKey.id);

        if (!cached) {
            console.log(
                `[VORTEX] 🗑️ Deleted message detected: ${deletedKey.id}`
            );

            return true;
        }

        const sender =
            getSender(cached);

        const remoteJid =
            cached.key?.remoteJid || "Unknown";

        const text =
            extractText(cached);

        const report =
            [
                "╭━━━〔 🗑️ ANTI-DELETE 〕━━━╮",
                "┃",
                "┃ ⚠️ Message deleted",
                "┃",
                `┃ 👤 Sender : ${sender}`,
                `┃ 💬 Chat   : ${remoteJid}`,
                `┃ 🆔 ID     : ${deletedKey.id}`,
                "┃",
                `┃ ${text ? `Message : ${text}` : "Media message deleted"}`,
                "┃",
                "╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯"
            ].join("\n");

        console.log(
            `[VORTEX] 🗑️ Deleted message recovered: ${deletedKey.id}`
        );

        // Send the recovery notice back to the chat.
        await sock.sendMessage(
            remoteJid,
            {
                text: report
            }
        );

        deleteCachedMessage(deletedKey.id);

        return true;

    } catch (error) {
        console.log(
            `[VORTEX] Anti-delete failed: ${error.message}`
        );

        return false;
    }
}

module.exports = {
    getSettings,
    setEnabled,
    cacheMessage,
    getCachedMessage,
    handleDelete
};
