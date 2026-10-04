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
        if (!loadSettings().enabled) return false;

        const u = update?.update || {};
        const proto = u.message?.protocolMessage;
        const isRevoke = u.messageStubType === 1 || proto?.type === 0;
        if (!isRevoke) return false;

        const id = proto?.key?.id || update?.key?.id;
        if (!id) return false;

        const cached = getCachedMessage(id);
        console.log(`[VORTEX] 🗑️ Delete detected: ${id} | cached=${!!cached}`);
        if (!cached || cached.key?.fromMe) return true;

        const me = String(sock.user?.id || "").replace(/:\d+(?=@)/, "");
        const chat = cached.key?.remoteJid || "";
        const isGroup = chat.endsWith("@g.us");
        const senderJid = cached.key?.participantAlt || cached.key?.participant ||
            cached.key?.remoteJidAlt || chat;
        const number = String(senderJid).split("@")[0].split(":")[0];

        let where = "Private chat";
        if (isGroup) {
            try { where = (await sock.groupMetadata(chat)).subject; }
            catch { where = "Group"; }
        }

        const content = cached.message || {};
        const mediaType = ["imageMessage", "videoMessage", "audioMessage", "stickerMessage"]
            .find(t => content[t]);
        const text = extractText(cached);

        const report =
`🗑️ *ANTI-DELETE*

👤 From : ${cached.pushName || "Unknown"} (${number})
💬 Chat : ${where}
📝 ${text ? "Message:\n" + text : mediaType ? "Deleted " + mediaType.replace("Message", "") + " (below)" : "Deleted a message"}`;

        await sock.sendMessage(me, { text: report });

        if (mediaType) {
            try {
                const b = await import("@whiskeysockets/baileys");
                const kind = mediaType.replace("Message", "");
                const stream = await b.downloadContentFromMessage(content[mediaType], kind);
                const chunks = [];
                for await (const c of stream) chunks.push(c);
                const buf = Buffer.concat(chunks);
                const cap = content[mediaType].caption || "";
                const out = kind === "image" ? { image: buf, caption: cap }
                    : kind === "video" ? { video: buf, caption: cap }
                    : kind === "sticker" ? { sticker: buf }
                    : { audio: buf, mimetype: "audio/mpeg", ptt: false };
                await sock.sendMessage(me, out);
            } catch (e) {
                console.log("[VORTEX] Anti-delete media failed: " + e.message);
            }
        }

        deleteCachedMessage(id);
        return true;
    } catch (error) {
        console.log(`[VORTEX] Anti-delete failed: ${error.message}`);
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
