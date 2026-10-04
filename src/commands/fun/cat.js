const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "cat", aliases: ["kitty"], category: "fun",
    permission: "public", description: "Random cat picture.",
    usage: ".cat",
    async execute(context) {
        try {
            await context.sock.sendMessage(context.remoteJid,
                { image: { url: `https://cataas.com/cat?t=${Date.now()}` }, caption: "🐱 Meow!" },
                { quoted: context.message });
            return null;
        } catch { return commandResponse("❌ Couldn't fetch a cat right now."); }
    }
};
