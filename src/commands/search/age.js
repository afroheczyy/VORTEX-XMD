const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "age", aliases: ["birthday"], category: "search",
    permission: "public", description: "Work out an age from a birth date.",
    usage: ".age 2000-05-14",
    async execute(context) {
        const raw = (context.args?.[0] || "").trim();
        const d = new Date(raw);
        const now = new Date();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || isNaN(d) || d > now)
            return commandResponse("🎂 Usage: .age 2000-05-14\n(format YYYY-MM-DD)");
        let y = now.getFullYear() - d.getFullYear();
        let mo = now.getMonth() - d.getMonth();
        let da = now.getDate() - d.getDate();
        if (da < 0) { mo--; da += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
        if (mo < 0) { y--; mo += 12; }
        let next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
        if (next <= now) next = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
        const days = Math.ceil((next - now) / 86400000);
        return commandResponse(`🎂 *Age*\n\n${y} years, ${mo} months, ${da} days\n🎉 Next birthday in ${days} day(s)`);
    }
};
