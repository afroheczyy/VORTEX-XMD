const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "ipinfo", aliases: ["ip", "iplookup"], category: "search",
    permission: "public", description: "Look up a public IP address.",
    usage: ".ipinfo 8.8.8.8",
    async execute(context) {
        const ip = (context.args?.[0] || "").trim();
        if (!/^[0-9a-fA-F:.]{3,45}$/.test(ip)) return commandResponse("🌐 Usage: .ipinfo 8.8.8.8");
        try {
            const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: AbortSignal.timeout(10000) });
            const d = await r.json();
            if (!d.success) throw new Error();
            return commandResponse(
`*🌐 ${d.ip}*

🌍 Country  : ${d.country} ${d.flag?.emoji || ""}
🏙️ City     : ${d.city || "?"}, ${d.region || ""}
🏢 Network  : ${d.connection?.isp || "?"}
🕒 Timezone : ${d.timezone?.id || "?"}

_Location is approximate._`);
        } catch { return commandResponse("❌ Couldn't look that up. Use a public IP address."); }
    }
};
