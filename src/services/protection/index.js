const settings = new Map();

const defaults = {
    antiLink: false,
    antiSpam: false,
    badword: false
};

const badwords = new Map();

function getSettings(groupJid) {
    if (!settings.has(groupJid)) {
        settings.set(groupJid, { ...defaults });
    }

    return { ...settings.get(groupJid) };
}

function setSetting(groupJid, name, value) {
    const current = getSettings(groupJid);

    if (!(name in current)) {
        throw new Error(`Unknown protection setting: ${name}`);
    }

    current[name] = Boolean(value);
    settings.set(groupJid, current);

    return current[name];
}

function hasLink(text) {
    if (!text) return false;

    return /(?:https?:\/\/|www\.|t\.me\/|wa\.me\/|chat\.whatsapp\.com\/)/i.test(
        text
    );
}

const spamTracker = new Map();

function isSpam(groupJid, sender) {
    const key = `${groupJid}:${sender}`;
    const now = Date.now();

    const previous = spamTracker.get(key) || [];

    const recent = previous.filter(
        timestamp => now - timestamp < 10000
    );

    recent.push(now);
    spamTracker.set(key, recent);

    return recent.length >= 6;
}

function getBadwords(groupJid) {
    return badwords.get(groupJid) || [];
}

function addBadword(groupJid, word) {
    const clean = String(word)
        .trim()
        .toLowerCase();

    if (!clean) return false;

    const current = getBadwords(groupJid);

    if (current.includes(clean)) {
        return false;
    }

    current.push(clean);
    badwords.set(groupJid, current);

    return true;
}

function removeBadword(groupJid, word) {
    const clean = String(word)
        .trim()
        .toLowerCase();

    const current = getBadwords(groupJid);

    const updated = current.filter(
        item => item !== clean
    );

    if (updated.length === current.length) {
        return false;
    }

    badwords.set(groupJid, updated);

    return true;
}

function containsBadword(text, groupJid) {
    if (!text) return false;

    const words = getBadwords(groupJid);

    if (!words.length) return false;

    const normalized = String(text).toLowerCase();

    return words.some(word => {
        const escaped = word.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const pattern = new RegExp(
            `(?:^|\\W)${escaped}(?:$|\\W)`,
            "i"
        );

        return pattern.test(normalized);
    });
}

module.exports = {
    getSettings,
    setSetting,
    hasLink,
    isSpam,
    getBadwords,
    addBadword,
    removeBadword,
    containsBadword
};
