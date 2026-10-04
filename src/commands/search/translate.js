const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "translate", aliases: ["tr", "trt"], category: "search",
    permission: "public", description: "Translate text to another language.",
    usage: ".translate <lang code> <text>",
    async execute(context) {
        const [lang, ...rest] = context.args || [];
        let text = rest.join(" ").trim();
        if (!text) {
            const q = context.message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            text = q?.conversation || q?.extendedTextMessage?.text || "";
        }
        if (!lang || !text) return commandResponse("🌍 Usage: .translate fr Good morning\n(or reply to a message with .translate fr)");
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=Autodetect|${encodeURIComponent(lang)}`;
            const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
            const out = (await r.json()).responseData?.translatedText;
            if (!out) throw new Error();
            return commandResponse(`🌍 *Translation (${lang})*\n\n${out}`);
        } catch { return commandResponse("❌ Translation failed. Use a code like fr, es, de, ar, tw."); }
    }
};
