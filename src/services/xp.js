const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../../database/xp.json");
const TITLES = ["Rookie", "Explorer", "Regular", "Veteran", "Elite", "Master", "Champion", "Legend", "Mythic", "Godlike"];
const last = new Map();
let db = {};
let dirty = false;

try { db = JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { db = {}; }

function save() {
    if (!dirty) return;
    try {
        fs.mkdirSync(path.dirname(FILE), { recursive: true });
        fs.writeFileSync(FILE, JSON.stringify(db));
        dirty = false;
    } catch {}
}
setInterval(save, 15000).unref();
process.on("exit", save);

const clean = j => String(j || "").split("@")[0].split(":")[0];
const levelOf = x => Math.floor(Math.sqrt(x / 50));
const need = l => 50 * l * l;
const titleOf = l => TITLES[Math.min(TITLES.length - 1, Math.floor(l / 3))];

function uidOf(message, sock) {
    const k = message?.key || {};
    if (k.fromMe) return clean(sock?.user?.id);
    return clean(k.participantAlt || k.participant || k.remoteJidAlt || k.remoteJid);
}

async function track(sock, message) {
    try {
        const jid = message?.key?.remoteJid || "";
        if (!jid || jid.endsWith("@broadcast") || jid.endsWith("@newsletter")) return;
        const m = message.message;
        if (!m || m.protocolMessage || m.reactionMessage) return;
        const uid = uidOf(message, sock);
        if (!uid) return;

        const chat = (db[jid] ||= {});
        const u = (chat[uid] ||= { xp: 0, msgs: 0, name: "" });
        u.msgs++;
        dirty = true;
        if (message.key.fromMe) u.name = sock.user?.name || u.name || "Owner";
        else if (message.pushName) u.name = message.pushName;

        const key = jid + "|" + uid;
        const now = Date.now();
        if (now - (last.get(key) || 0) < 30000) return;
        if (last.size > 5000) last.clear();
        last.set(key, now);

        const before = levelOf(u.xp);
        u.xp += 5 + Math.floor(Math.random() * 11);
        const after = levelOf(u.xp);

        if (after > before && jid.endsWith("@g.us")) {
            await sock.sendMessage(jid, {
                text: `🎉 *${u.name || uid}* reached *Level ${after}*\n🏅 ${titleOf(after)}`
            }, { quoted: message });
        }
    } catch {}
}

function stats(jid, uid) {
    const chat = db[jid] || {};
    const u = chat[uid];
    if (!u) return null;
    const sorted = Object.entries(chat).sort((a, b) => b[1].xp - a[1].xp);
    const level = levelOf(u.xp);
    return {
        ...u, uid, level, title: titleOf(level),
        pos: sorted.findIndex(([k]) => k === uid) + 1, total: sorted.length,
        from: need(level), to: need(level + 1)
    };
}

function top(jid, n = 10) {
    return Object.entries(db[jid] || {})
        .sort((a, b) => b[1].xp - a[1].xp).slice(0, n)
        .map(([uid, u]) => ({ uid, ...u, level: levelOf(u.xp), title: titleOf(levelOf(u.xp)) }));
}

function daily(jid, uid) {
    const chat = (db[jid] ||= {});
    const u = (chat[uid] ||= { xp: 0, msgs: 0, name: "" });
    const wait = 20 * 3600000 - (Date.now() - (u.lastDaily || 0));
    if (wait > 0) return { ok: false, wait };
    const gained = 100 + Math.floor(Math.random() * 201);
    u.xp += gained;
    u.lastDaily = Date.now();
    dirty = true;
    return { ok: true, gained, level: levelOf(u.xp) };
}

module.exports = { track, stats, top, daily, uidOf, clean };
