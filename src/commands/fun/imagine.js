const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "imagine", aliases: ["img", "draw", "aiimage"], category: "fun",
    permission: "public", description: "Make an AI picture from text.",
    usage: ".imagine a lion wearing a crown",
    async execute(context) {
        const prompt = (context.args || []).join(" ").trim().slice(0, 300);
        if (!prompt) return commandResponse("🎨 Usage: .imagine a lion wearing a crown");
        await context.sock.sendMessage(context.remoteJid, { text: "🎨 Drawing... this can take up to a minute." }, { quoted: context.message });
        try {
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=768&nologo=true&seed=${Date.now() % 100000}`;
            const r = await fetch(url, { signal: AbortSignal.timeout(90000) });
            if (!r.ok || !(r.headers.get("content-type") || "").startsWith("image")) throw new Error();
            const image = Buffer.from(await r.arrayBuffer());
            await context.sock.sendMessage(context.remoteJid, { image, caption: `🎨 ${prompt}` }, { quoted: context.message });
            return null;
        } catch { return commandResponse("❌ The image service is busy or has changed. Try again in a minute."); }
    }
};
