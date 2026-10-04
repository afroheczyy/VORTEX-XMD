const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "timein", aliases: ["worldtime", "tz"], category: "general",
    permission: "public", description: "Current time in any timezone.",
    usage: ".timein Africa/Accra",
    async execute(context) {
        const tz = (context.args?.[0] || "").trim();
        if (!tz) return commandResponse("🕒 Usage: .timein Africa/Accra\nOthers: Europe/London, America/New_York, Asia/Tokyo");
        try {
            const out = new Intl.DateTimeFormat("en-GB", { timeZone: tz, dateStyle: "full", timeStyle: "short" }).format(new Date());
            return commandResponse(`🕒 *${tz}*\n\n${out}`);
        } catch { return commandResponse("❌ Unknown timezone. Use the format Continent/City."); }
    }
};
