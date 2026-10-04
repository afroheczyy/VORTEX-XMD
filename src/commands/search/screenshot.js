const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "screenshot", aliases: ["ss", "ssweb"], category: "search",
    permission: "public", description: "Screenshot of a public website.",
    usage: ".screenshot https://example.com",
    async execute(context) {
        let url = (context.args?.[0] || "").trim();
        if (!url) return commandResponse("📸 Usage: .screenshot https://example.com");
        if (!/^https?:\/\//i.test(url)) url = "https://" + url;
        try { new URL(url); } catch { return commandResponse("❌ That isn't a valid link."); }
        try {
            await context.sock.sendMessage(context.remoteJid,
                { image: { url: `https://image.thum.io/get/width/1280/crop/900/${url}` }, caption: `📸 ${url}` },
                { quoted: context.message });
            return null;
        } catch { return commandResponse("❌ Couldn't capture that site."); }
    }
};
