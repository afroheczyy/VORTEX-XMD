const fs = require("fs");
const path = require("path");

const SETTINGS_FILE = path.resolve(
    __dirname,
    "../../../database/reaction.json"
);

const defaults = {
    enabled: true,
    emoji: "⚡"
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

function setEnabled(value) {
    const settings = loadSettings();

    settings.enabled = Boolean(value);

    saveSettings(settings);

    return settings.enabled;
}

function setEmoji(emoji) {
    const settings = loadSettings();

    const clean = String(emoji || "").trim();

    if (!clean) {
        throw new Error("Emoji cannot be empty.");
    }

    settings.emoji = clean;

    saveSettings(settings);

    return settings.emoji;
}

async function reactToCommand(sock, message) {
    try {
        const settings = loadSettings();

        if (!settings.enabled) {
            return false;
        }

        if (!message?.key) {
            return false;
        }

        const jid = message.key.remoteJid;

        if (!jid) {
            return false;
        }

        await sock.sendMessage(
            jid,
            {
                react: {
                    text: settings.emoji,
                    key: message.key
                }
            }
        );

        return true;
    } catch (error) {
        console.log(
            `[VORTEX] Command reaction failed: ${error.message}`
        );

        return false;
    }
}

module.exports = {
    getSettings,
    setEnabled,
    setEmoji,
    reactToCommand
};
