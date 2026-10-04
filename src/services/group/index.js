const warnings = new Map();

const DEFAULT_LIMIT = 3;

function getKey(groupJid, userJid) {
    return `${groupJid}:${userJid}`;
}

function getWarnings(groupJid, userJid) {
    return warnings.get(
        getKey(groupJid, userJid)
    ) || 0;
}

function addWarning(groupJid, userJid) {
    const key = getKey(groupJid, userJid);

    const count =
        getWarnings(groupJid, userJid) + 1;

    warnings.set(key, count);

    return count;
}

function resetWarnings(groupJid, userJid) {
    warnings.delete(
        getKey(groupJid, userJid)
    );
}

function getAllWarnings(groupJid) {
    const result = {};

    for (const [key, count] of warnings.entries()) {
        if (!key.startsWith(`${groupJid}:`)) {
            continue;
        }

        const userJid =
            key.slice(`${groupJid}:`.length);

        result[userJid] = count;
    }

    return result;
}

function getWarningLimit() {
    return DEFAULT_LIMIT;
}

module.exports = {
    getWarnings,
    addWarning,
    resetWarnings,
    getAllWarnings,
    getWarningLimit
};
