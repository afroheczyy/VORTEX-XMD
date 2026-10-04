const fs = require("fs");
const path = require("path");
const config = require("../../config/config");

const FILE = path.join(__dirname, "../../database/afk.json");
const cool = new Map();
let db = {};
try { db = JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { db = {}; }

const save = () => {
    try {
        fs.mkdirSync(path.dirname(FILE), { recursive: true });
        fs.writeFileSync(FILE, JSON.stringify(db));
    } catch {}
};
const clean = j => String(j || "").split("@")[0].split(":")[0];

function ids(message, sock) {
    const k = message?.key || {};
    if (k.fromMe) return [clean(sock.user?.id), clean(sock.user?.lid)].filter(Boolean);
    return [k.participantAlt, k.participant, k.remoteJidAlt, k.remoteJid].map(clean).filter(Boolean);
}

function textOf(m) {
    return m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption || m.videoMessage?.caption || "";
}

function ago(ms) {
    const m = Math.floor(ms / 60000);
    if (m < 60) return `${Math.max(1, m)} min`;
    const h = Math.floor(m / 60);
    return h < 24 ? `${h}h ${m % 60}m` : `${Math.floor(h / 24)}d ${h % 24}h`;
}

function set(message, sock, reason) {
    const entry = { reason: reason || "Away", since: Date.now(), name: message.pushName || "" };
    for (const id of ids(message, sock)) db[id] = entry;
    save();
}

async function track(sock, message) {
    try {
        const m = message?.message;
        if (!m || m.protocolMessage || m.reactionMessage) return;
        const jid = message.key.remoteJid || "";
        if (!jid || jid.endsWith("@broadcast") || jid.endsWith("@newsletter")) return;

        const t = textOf(m).trim();
        const me = ids(message, sock);

        const mine = me.find(i => db[i]);
        if (mine && !t.startsWith(config.bot.prefix)) {
            const e = db[mine];
            for (const i of Object.keys(db)) if (db[i] === e) delete db[i];
            save();
            await sock.sendMessage(jid, { text: `👋 Welcome back! You were away for ${ago(Date.now() - e.since)}.` }, { quoted: message });
            return;
        }

        if (message.key.fromMe) return;
        const ci = m.extendedTextMessage?.contextInfo || {};
        const targets = [...(ci.mentionedJid || []), ci.participant].filter(Boolean).map(clean);
        for (const tg of new Set(targets)) {
            const e = db[tg];
            if (!e || me.includes(tg)) continue;
            const key = jid + tg;
            if (Date.now() - (cool.get(key) || 0) < 60000) continue;
            cool.set(key, Date.now());
            if (cool.size > 2000) cool.clear();
            await sock.sendMessage(jid, {
                text: `💤 *${e.name || "They"}* is AFK\n📝 ${e.reason}\n⏱️ Away for ${ago(Date.now() - e.since)}`
            }, { quoted: message });
        }
    } catch {}
}

module.exports = { track, set };
