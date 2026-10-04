const settings = new Map();

function getSettings(groupJid) {
    if (!settings.has(groupJid)) {
        settings.set(groupJid, {
            welcome: false,
            goodbye: false
        });
    }

    return { ...settings.get(groupJid) };
}

function setSetting(groupJid, name, value) {
    const current = getSettings(groupJid);

    if (!(name in current)) {
        throw new Error(`Unknown group event: ${name}`);
    }

    current[name] = Boolean(value);
    settings.set(groupJid, current);

    return current[name];
}

function formatUser(jid) {
    return `@${String(jid).split("@")[0]}`;
}

async function handleGroupParticipantsUpdate(sock, update) {
    const {
        id: groupJid,
        participants = [],
        action
    } = update || {};

    if (!groupJid || !participants.length) {
        return;
    }

    const config = getSettings(groupJid);

    if (action === "add" && config.welcome) {
        for (const participant of participants) {
            await sock.sendMessage(groupJid, {
                text:
                    `╭━━━〔 🌀 VORTEX XMD 〕━━━╮\n` +
                    `┃\n` +
                    `┃ 👋 *WELCOME!*\n` +
                    `┃\n` +
                    `┃ Welcome ${formatUser(participant)}\n` +
                    `┃\n` +
                    `┃ 📌 Please read the group rules.\n` +
                    `┃ 🤝 Respect everyone.\n` +
                    `┃ 🌀 Enjoy your stay!\n` +
                    `┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                    `Powered by Hector 🌀`,
                mentions: [participant]
            });
        }
    }

    if (
        (action === "remove" || action === "leave") &&
        config.goodbye
    ) {
        for (const participant of participants) {
            await sock.sendMessage(groupJid, {
                text:
                    `╭━━━〔 🌀 VORTEX XMD 〕━━━╮\n` +
                    `┃\n` +
                    `┃ 👋 *GOODBYE!*\n` +
                    `┃\n` +
                    `┃ ${formatUser(participant)} has left the group.\n` +
                    `┃\n` +
                    `┃ Take care and stay safe. 🌀\n` +
                    `┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                    `Powered by Hector 🌀`,
                mentions: [participant]
            });
        }
    }
}

module.exports = {
    getSettings,
    setSetting,
    handleGroupParticipantsUpdate
};
