const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "color", aliases: ["colour", "hex"], category: "search",
    permission: "public", description: "Details for a hex colour.",
    usage: ".color 5B2EA6",
    async execute(context) {
        let h = (context.args?.[0] || "").replace("#", "").trim();
        if (/^[0-9a-f]{3}$/i.test(h)) h = h.split("").map(c => c + c).join("");
        if (!/^[0-9a-f]{6}$/i.test(h)) return commandResponse("🎨 Usage: .color 5B2EA6");
        const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
        const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255, l = (mx + mn) / 2;
        let hue = 0, sat = 0;
        if (mx !== mn) {
            const d = mx - mn;
            sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
            if (mx === r / 255) hue = ((g - b) / 255 / d + (g < b ? 6 : 0));
            else if (mx === g / 255) hue = ((b - r) / 255 / d + 2);
            else hue = ((r - g) / 255 / d + 4);
            hue *= 60;
        }
        const text = commandResponse(
`*🎨 #${h.toUpperCase()}*

RGB : ${r}, ${g}, ${b}
HSL : ${Math.round(hue)}°, ${Math.round(sat * 100)}%, ${Math.round(l * 100)}%
Light: ${l > 0.5 ? "light colour" : "dark colour"}`);
        try {
            await context.sock.sendMessage(context.remoteJid,
                { image: { url: `https://singlecolorimage.com/get/${h}/400x400` }, caption: text },
                { quoted: context.message });
            return null;
        } catch { return text; }
    }
};
