const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "meme", aliases: ["memes"], category: "fun",
    permission: "public", description: "Random meme.",
    usage: ".meme",
    async execute(context) {
        try {
            for (let i = 0; i < 4; i++) {
                const r = await fetch("https://meme-api.com/gimme", { signal: AbortSignal.timeout(10000) });
                const d = await r.json();
                if (!d.url || d.nsfw || d.spoiler || !/\.(jpe?g|png)$/i.test(d.url)) continue;
                await context.sock.sendMessage(context.remoteJid,
                    { image: { url: d.url }, caption: `😂 ${String(d.title || "").slice(0, 150)}` },
                    { quoted: context.message });
                return null;
            }
            throw new Error();
        } catch { return commandResponse("❌ Couldn't fetch a meme right now. Try again."); }
    }
};
