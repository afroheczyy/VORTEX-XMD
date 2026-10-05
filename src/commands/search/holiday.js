const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "holiday", aliases: ["holidays", "publicholiday"], category: "search",
    permission: "public", description: "Upcoming public holidays for a country.",
    usage: ".holiday GH",
    async execute(context) {
        const cc = (context.args?.[0] || "GH").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
        if (cc.length !== 2) return commandResponse("📅 Usage: .holiday GH\n(2-letter country code: GH, NG, US, GB, ZA...)");
        try {
            const r = await fetch(`https://date.nager.at/api/v3/NextPublicHolidays/${cc}`, { signal: AbortSignal.timeout(10000) });
            if (!r.ok) throw new Error();
            const list = (await r.json()).slice(0, 8);
            if (!list.length) throw new Error();
            const rows = list.map(h => `📌 ${h.date}  ${h.localName}${h.name !== h.localName ? " (" + h.name + ")" : ""}`);
            return commandResponse(`*📅 Next holidays: ${cc}*\n\n${rows.join("\n")}`);
        } catch { return commandResponse("❌ Unknown country code or the service is busy."); }
    }
};
