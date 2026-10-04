const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "../../database/saver.json");
const cache = new Map();
const EMOJI = /^[\p{Extended_Pictographic}\p{Emoji_Modifier}\u200d\ufe0f\s]{1,16}$/u;
const TYPES = ["imageMessage", "videoMessage", "audioMessage"];

function enabled() {
    try { return JSON.parse(fs.readFileSync(FILE, "utf8")).enabled !== false; } catch { return true; }
}
function setEnabled(v) { fs.writeFileSync(FILE, JSON.stringify({ enabled: !!v })); }

function unwrap(m) {
    let x = m || {};
    for (let i = 0; i < 5; i++) {
        const n = x.ephemeralMessage?.message || x.viewOnceMessageV2?.message ||
            x.viewOnceMessageV2Extension?.message || x.viewOnceMessage?.message ||
            x.documentWithCaptionMessage?.message || x.editedMessage?.message;
        if (!n) break;
        x = n;
    }
    return x;
}

function remember(message) {
    const raw = message.message;
    const id = message.key?.id;
    if (!raw || !id) return;
    const inner = unwrap(raw);
    const type = TYPES.find(t => inner[t]);
    if (!type) return;
    const jid = message.key.remoteJid || "";
    const isStatus = jid === "status@broadcast";
    const isVO = !!(raw.viewOnceMessage || raw.viewOnceMessageV2 ||
        raw.viewOnceMessageV2Extension || inner[type].viewOnce);
    if (!isStatus && !isVO) return;
    cache.set(id, {
        type, node: inner[type], isStatus,
        from: message.key.participant || jid,
        name: message.pushName || ""
    });
    while (cache.size > 300) cache.delete(cache.keys().next().value);
}

async function send(sock, entry) {
    const b = await import("@whiskeysockets/baileys");
    const kind = entry.type.replace("Message", "");
    const stream = await b.downloadContentFromMessage(entry.node, kind);
    const chunks = [];
    for await (const c of stream) chunks.push(c);
    const buf = Buffer.concat(chunks);
    const me = String(sock.user?.id || "").replace(/:\d+(?=@)/, "");
    const who = entry.name || String(entry.from).split("@")[0].split(":")[0];
    const cap = `${entry.isStatus ? "📥 Status" : "👁️ View-once"} from ${who}` +
        (entry.node.caption ? `\n\n${entry.node.caption}` : "");
    const content = kind === "image" ? { image: buf, caption: cap }
        : kind === "video" ? { video: buf, caption: cap }
        : { audio: buf, mimetype: "audio/mpeg", ptt: false };
    await sock.sendMessage(me, content);
    if (kind === "audio") await sock.sendMessage(me, { text: cap });
}

async function process(sock, message) {
    try {
        if (!message?.key) return;
        if (!message.key.fromMe) { remember(message); return; }
        if (!enabled()) return;

        const inner = unwrap(message.message);
        let emoji = "", targetId = "", quoted = null, ctxJid = "";

        if (inner.reactionMessage) {
            emoji = inner.reactionMessage.text || "";
            targetId = inner.reactionMessage.key?.id;
        } else {
            emoji = inner.conversation || inner.extendedTextMessage?.text || "";
            const ci = inner.extendedTextMessage?.contextInfo;
            targetId = ci?.stanzaId;
            quoted = ci?.quotedMessage;
            ctxJid = ci?.remoteJid || "";
        }
        if (!emoji || !EMOJI.test(emoji.trim())) return;

        let entry = targetId && cache.get(targetId);
        if (!entry && quoted) {
            const q = unwrap(quoted);
            const type = TYPES.find(t => q[t]);
            const isVO = !!(quoted.viewOnceMessage || quoted.viewOnceMessageV2 ||
                quoted.viewOnceMessageV2Extension || (type && q[type].viewOnce));
            if (type && (isVO || ctxJid === "status@broadcast"))
                entry = { type, node: q[type], isStatus: ctxJid === "status@broadcast", from: message.key.remoteJid, name: "" };
        }
        if (!entry) return;
        await send(sock, entry);
    } catch (e) {
        console.log("[VORTEX] Saver failed: " + e.message);
    }
}

module.exports = { process, enabled, setEnabled };
