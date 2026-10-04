const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "dog", aliases: ["puppy"], category: "fun",
    permission: "public", description: "Random dog picture.",
    usage: ".dog",
    async execute(context) {
        try {
            const r = await fetch("https://dog.ceo/api/breeds/image/random", { signal: AbortSignal.timeout(10000) });
            const url = (await r.json()).message;
            await context.sock.sendMessage(context.remoteJid,
                { image: { url }, caption: "🐶 Woof!" }, { quoted: context.message });
            return null;
        } catch { return commandResponse("❌ Couldn't fetch a dog right now."); }
    }
};
