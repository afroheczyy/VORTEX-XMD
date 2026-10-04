const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "tts", aliases: ["say", "speak"], category: "media",
    permission: "public", description: "Turn text into a voice note.",
    usage: ".tts <text>  or  .tts fr | Bonjour",
    async execute(context) {
        let raw = (context.args || []).join(" ").trim();
        let lang = "en";
        if (raw.includes("|")) {
            const [l, ...r] = raw.split("|");
            lang = l.trim().toLowerCase() || "en";
            raw = r.join("|").trim();
        }
        if (!raw) return commandResponse("🔊 Usage: .tts Hello world\nOther language: .tts fr | Bonjour");
        try {
            const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(raw.slice(0, 200))}`;
            const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(15000) });
            if (!r.ok) throw new Error();
            const audio = Buffer.from(await r.arrayBuffer());
            await context.sock.sendMessage(context.remoteJid,
                { audio, mimetype: "audio/mpeg", ptt: true }, { quoted: context.message });
            return null;
        } catch { return commandResponse("❌ Couldn't make the voice note. Check the language code."); }
    }
};
