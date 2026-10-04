const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");

const FILE = path.join(__dirname, "../../../database/chatbot.json");
const MODEL = "claude-haiku-4-5-20251001";
const DEFAULT_PERSONA =
    "You are texting as Hector (from Ghana) on WhatsApp while he is busy. " +
    "Text exactly like a real person: casual, short, lowercase is fine, light slang, an occasional emoji. " +
    "Use English, Pidgin or Twi only if the other person does. Never sound like an assistant. " +
    "No bullet points, no markdown. Match their language and mood. " +
    "If you don't know something about Hector's life, plans or whereabouts, don't invent it: say you'll check and get back. " +
    "Never agree to send money, share passwords, codes or personal details, or commit to anything on his behalf. " +
    "If someone sincerely asks whether they are talking to a bot or AI, be honest: say you're Hector's assistant, he's busy, and you'll pass the message on.";

const history = new Map();
const last = new Map();
const busy = new Set();
const paused = new Map();
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clean = j => String(j || "").replace(/:\d+(?=@)/, "").toLowerCase();

function load() {
    try {
        return { enabled: [], muted: [], allDMs: false, voice: false, lang: "en",
            rules: [], persona: DEFAULT_PERSONA, ...JSON.parse(fs.readFileSync(FILE, "utf8")) };
    } catch {
        return { enabled: [], muted: [], allDMs: false, voice: false, lang: "en",
            rules: [], persona: DEFAULT_PERSONA };
    }
}
function save(d) { fs.writeFileSync(FILE, JSON.stringify(d, null, 2)); }
function clearHistory(jid) { jid ? history.delete(jid) : history.clear(); }

function addressed(sock, message) {
    const ci = message.message?.extendedTextMessage?.contextInfo || {};
    const me = [sock.user?.id, sock.user?.lid].map(clean);
    if ((ci.mentionedJid || []).some(j => me.includes(clean(j)))) return true;
    return !!ci.participant && me.includes(clean(ci.participant));
}

async function voiceNote(sock, jid, text, lang) {
    const r = await fetch(
        `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text.slice(0, 200))}`,
        { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error("tts failed");
    const mp3 = Buffer.from(await r.arrayBuffer());
    const id = Date.now();
    const a = path.join(os.tmpdir(), `cb-${id}.mp3`);
    const b = path.join(os.tmpdir(), `cb-${id}.ogg`);
    try {
        fs.writeFileSync(a, mp3);
        try {
            await new Promise((res, rej) => execFile("ffmpeg",
                ["-y", "-i", a, "-c:a", "libopus", "-b:a", "32k", "-f", "ogg", b], e => (e ? rej(e) : res())));
            await sock.sendMessage(jid, { audio: fs.readFileSync(b), mimetype: "audio/ogg; codecs=opus", ptt: true });
        } catch {
            await sock.sendMessage(jid, { audio: mp3, mimetype: "audio/mpeg", ptt: true });
        }
    } finally {
        for (const f of [a, b]) fs.rmSync(f, { force: true });
    }
}

async function handle(sock, message, text) {
    const key = message.key || {};
    const jid = key.remoteJid || "";
    if (!jid || jid.endsWith("@broadcast") || jid.endsWith("@newsletter")) return;

    const db = load();
    const isGroup = jid.endsWith("@g.us");
    console.log("[CHATBOT-DEBUG]", jid, "fromMe=" + key.fromMe, "enabled=" + db.enabled.includes(jid), "paused=" + ((paused.get(jid)||0) > Date.now()), "text=" + !!text);

    // You typed in this chat yourself: stay quiet for 30 minutes
    if (key.fromMe) {
        if (db.enabled.includes(jid) || db.allDMs) paused.set(jid, Date.now() + 5 * 60000);
        return;
    }

    if (!text || text.length > 1000) return;
    const on = db.enabled.includes(jid) || (db.allDMs && !isGroup && !db.muted.includes(jid));
    if (!on) return;
    if ((paused.get(jid) || 0) > Date.now()) return;

    const lower = text.toLowerCase();
    const rule = db.rules.find(x => lower.includes(x.k));
    if (rule) {
        await sock.sendMessage(jid, { text: rule.r }, { quoted: message });
        return;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return;
    if (isGroup && !addressed(sock, message)) return;

    const now = Date.now();
    if (busy.has(jid) || now - (last.get(jid) || 0) < 2500) return;
    busy.add(jid);
    last.set(jid, now);

    const h = history.get(jid) || [];
    history.set(jid, h);
    h.push({ role: "user", content: (isGroup ? `${message.pushName || "Someone"}: ` : "") + text });
    while (h.length > 16) h.shift();
    while (h.length && h[0].role !== "user") h.shift();

    try {
        sock.readMessages([key]).catch(() => {});
        await sleep(1000 + Math.random() * 2000);

        const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 300,
                system: db.persona +
                    " Reply with 1 to 3 short chat messages, separated by a blank line. Plain text only.",
                messages: h
            }),
            signal: AbortSignal.timeout(30000)
        });
        if (!res.ok) { h.pop(); console.log(`[VORTEX] Chatbot API error ${res.status}`); return; }

        const data = await res.json();
        const reply = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("").trim();
        if (!reply) { h.pop(); return; }
        h.push({ role: "assistant", content: reply });

        const chunks = reply.split(/\n{2,}/).map(s => s.trim()).filter(Boolean).slice(0, 3);

        if (db.voice && chunks.length === 1 && chunks[0].length < 150 && Math.random() < 0.4) {
            await sock.sendPresenceUpdate("recording", jid).catch(() => {});
            await sleep(2000);
            try { await voiceNote(sock, jid, chunks[0], db.lang); return; } catch {}
        }

        for (let i = 0; i < chunks.length; i++) {
            await sock.sendPresenceUpdate("composing", jid).catch(() => {});
            await sleep(Math.min(5000, 600 + chunks[i].length * 40));
            await sock.sendMessage(jid, { text: chunks[i] },
                isGroup && i === 0 ? { quoted: message } : undefined);
        }
    } catch (e) {
        h.pop();
        console.log(`[VORTEX] Chatbot failed: ${e.message}`);
    } finally {
        sock.sendPresenceUpdate("paused", jid).catch(() => {});
        busy.delete(jid);
    }
}

module.exports = { handle, load, save, clearHistory, DEFAULT_PERSONA };
