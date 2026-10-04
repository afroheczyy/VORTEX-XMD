const fs = require("fs");
const path = require("path");

const {
    downloadMediaMessage
} = require("@whiskeysockets/baileys");

const SETTINGS_FILE = path.resolve(
    __dirname,
    "../../../database/automation.json"
);

const STATUS_DIR = path.resolve(
    __dirname,
    "../../../database/status"
);

const defaults = {
    autoView: false,
    autoReact: false,
    autoSave: false,
    autoTyping: false,
    autoRecording: false,
    autoTypeRecord: false,
    reactEmoji: "❤️"
};

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

function setSetting(name, value) {
    const settings = loadSettings();

    if (!(name in settings)) {
        throw new Error(
            `Unknown automation setting: ${name}`
        );
    }

    settings[name] = Boolean(value);

    saveSettings(settings);

    return settings[name];
}

function isStatusMessage(message) {
    const jid = message?.key?.remoteJid || "";

    return (
        jid === "status@broadcast" ||
        jid.endsWith("@broadcast")
    );
}

function safeName(value) {
    return String(value || "status")
        .replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function viewStatus(sock, message) {
    try {
        if (!message?.key) return false;

        await sock.readMessages([
            message.key
        ]);

        console.log(
            `[VORTEX] 👀 Status viewed: ${message.key.id || "unknown"}`
        );

        return true;
    } catch (error) {
        console.log(
            `[VORTEX] Status view failed: ${error.message}`
        );

        return false;
    }
}

async function reactStatus(sock, message) {
    try {
        if (!message?.key) return false;

        const settings = loadSettings();

        await sock.sendMessage(
            message.key.remoteJid,
            {
                react: {
                    text:
                        settings.reactEmoji || "❤️",
                    key: message.key
                }
            }
        );

        console.log(
            `[VORTEX] ❤️ Status reacted: ${message.key.id || "unknown"}`
        );

        return true;
    } catch (error) {
        console.log(
            `[VORTEX] Status reaction failed: ${error.message}`
        );

        return false;
    }
}

async function saveStatus(sock, message) {
    try {
        if (!message?.message) {
            return false;
        }

        fs.mkdirSync(
            STATUS_DIR,
            { recursive: true }
        );

        const timestamp = Date.now();
        const id = safeName(
            message.key?.id
        );

        const hasImage =
            Boolean(message.message.imageMessage);

        const hasVideo =
            Boolean(message.message.videoMessage);

        const hasAudio =
            Boolean(message.message.audioMessage);

        if (
            !hasImage &&
            !hasVideo &&
            !hasAudio
        ) {
            return false;
        }

        let extension = "bin";

        if (hasImage) extension = "jpg";
        if (hasVideo) extension = "mp4";
        if (hasAudio) extension = "ogg";

        const filePath = path.join(
            STATUS_DIR,
            `${timestamp}_${id}.${extension}`
        );

        const buffer =
            await downloadMediaMessage(
                message,
                "buffer",
                {}
            );

        fs.writeFileSync(
            filePath,
            buffer
        );

        console.log(
            `[VORTEX] 💾 Status saved: ${filePath}`
        );

        return filePath;
    } catch (error) {
        console.log(
            `[VORTEX] Status save failed: ${error.message}`
        );

        return false;
    }
}

async function sendTyping(sock, jid) {
    try {
        if (!jid) return false;

        await sock.sendPresenceUpdate(
            "composing",
            jid
        );

        console.log(
            `[VORTEX] ⌨️ Typing presence: ${jid}`
        );

        return true;
    } catch (error) {
        console.log(
            `[VORTEX] Typing failed: ${error.message}`
        );

        return false;
    }
}

async function sendRecording(sock, jid) {
    try {
        if (!jid) return false;

        await sock.sendPresenceUpdate(
            "recording",
            jid
        );

        console.log(
            `[VORTEX] 🎙️ Recording presence: ${jid}`
        );

        return true;
    } catch (error) {
        console.log(
            `[VORTEX] Recording failed: ${error.message}`
        );

        return false;
    }
}

async function clearPresence(sock, jid) {
    try {
        if (!jid) return false;

        await sock.sendPresenceUpdate(
            "paused",
            jid
        );

        return true;
    } catch {
        return false;
    }
}

async function handleStatus(sock, message) {
    if (!isStatusMessage(message)) {
        return false;
    }

    const settings = loadSettings();

    if (settings.autoView) {
        await viewStatus(
            sock,
            message
        );
    }

    if (settings.autoReact) {
        await reactStatus(
            sock,
            message
        );
    }

    if (settings.autoSave) {
        await saveStatus(
            sock,
            message
        );
    }

    return true;
}

async function handlePresence(
    sock,
    jid,
    mode = "typing"
) {
    const settings = loadSettings();

    if (
        settings.autoTypeRecord
    ) {
        if (mode === "recording") {
            return sendRecording(
                sock,
                jid
            );
        }

        return sendTyping(
            sock,
            jid
        );
    }

    if (
        mode === "recording" &&
        settings.autoRecording
    ) {
        return sendRecording(
            sock,
            jid
        );
    }

    if (
        mode === "typing" &&
        settings.autoTyping
    ) {
        return sendTyping(
            sock,
            jid
        );
    }

    return false;
}

module.exports = {
    getSettings,
    setSetting,
    saveSettings,

    isStatusMessage,
    viewStatus,
    reactStatus,
    saveStatus,
    handleStatus,

    sendTyping,
    sendRecording,
    clearPresence,
    handlePresence
};
