const chatbot = require("./index");

function key() {
    return process.env.GROQ_API_KEY ||
        ((process.env.CHAT_PROVIDER || "").toLowerCase() === "groq" ? process.env.CHAT_API_KEY : "") || "";
}

const hasKey = () => { const k = key(); return !!k && !/your_key_here/i.test(k); };

async function download(audio) {
    const b = await import("@whiskeysockets/baileys");
    const stream = await b.downloadContentFromMessage(audio, "audio");
    const chunks = [];
    for await (const c of stream) chunks.push(c);
    return Buffer.concat(chunks);
}

async function transcribe(buf) {
    const form = new FormData();
    form.append("file", new Blob([buf], { type: "audio/ogg" }), "voice.ogg");
    form.append("model", process.env.STT_MODEL || "whisper-large-v3");
    form.append("response_format", "json");
    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { authorization: "Bearer " + key() },
        body: form,
        signal: AbortSignal.timeout(40000)
    });
    if (!res.ok) { console.log(`[VORTEX] Transcribe error ${res.status}`); return ""; }
    return String((await res.json()).text || "").trim();
}

async function process_(sock, message) {
    try {
        if (!hasKey() || !message?.key || message.key.fromMe) return;
        const jid = message.key.remoteJid || "";
        if (!jid || jid.endsWith("@g.us") || jid.endsWith("@broadcast") || jid.endsWith("@newsletter")) return;

        const m = message.message?.ephemeralMessage?.message || message.message || {};
        const a = m.audioMessage;
        if (!a || !a.ptt || (a.seconds || 0) > 60) return;

        const db = chatbot.load();
        const on = db.enabled.includes(jid) || (db.allDMs && !db.muted.includes(jid));
        if (!on) return;

        const text = await transcribe(await download(a));
        if (!text) return;
        console.log("[VORTEX] Voice note transcribed: " + text.slice(0, 60));
        await chatbot.handle(sock, message, "(voice note) " + text);
    } catch (e) {
        console.log("[VORTEX] Voice handling failed: " + e.message);
    }
}

module.exports = { process: process_, transcribe, download, hasKey };
