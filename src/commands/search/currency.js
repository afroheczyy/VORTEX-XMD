const { commandResponse } = require("../../utils/branding");
module.exports = {
    name: "currency", aliases: ["convert", "fx"], category: "search",
    permission: "public", description: "Convert money between currencies.",
    usage: ".currency 100 USD GHS",
    async execute(context) {
        const [amt, from, to] = context.args || [];
        const n = parseFloat(amt);
        if (!n || !from || !to) return commandResponse("💱 Usage: .currency 100 USD GHS");
        try {
            const r = await fetch(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`,
                { signal: AbortSignal.timeout(10000) });
            const d = await r.json();
            const rate = d.rates?.[to.toUpperCase()];
            if (!rate) throw new Error();
            return commandResponse(
`💱 *Currency*

${n} ${from.toUpperCase()} = *${(n * rate).toLocaleString("en", { maximumFractionDigits: 2 })} ${to.toUpperCase()}*
Rate: 1 ${from.toUpperCase()} = ${rate.toFixed(4)} ${to.toUpperCase()}`);
        } catch { return commandResponse("❌ Unknown currency code. Try USD, GHS, EUR, GBP, NGN."); }
    }
};
