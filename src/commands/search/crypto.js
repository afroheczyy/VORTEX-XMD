const { commandResponse } = require("../../utils/branding");
const MAP = { btc: "bitcoin", eth: "ethereum", sol: "solana", bnb: "binancecoin", xrp: "ripple",
    doge: "dogecoin", usdt: "tether", ada: "cardano", ton: "the-open-network", trx: "tron" };
module.exports = {
    name: "crypto", aliases: ["price"], category: "search",
    permission: "public", description: "Live crypto price in USD.",
    usage: ".crypto btc",
    async execute(context) {
        const q = (context.args?.[0] || "btc").toLowerCase().replace(/[^a-z0-9-]/g, "");
        const id = MAP[q] || q;
        try {
            const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`,
                { signal: AbortSignal.timeout(10000) });
            const d = (await r.json())[id];
            if (!d) throw new Error();
            const ch = d.usd_24h_change || 0;
            return commandResponse(
`*🪙 ${id.toUpperCase()}*

💵 Price : $${d.usd.toLocaleString("en", { maximumFractionDigits: 6 })}
${ch >= 0 ? "📈" : "📉"} 24h   : ${ch.toFixed(2)}%

_Information only, not financial advice._`);
        } catch { return commandResponse("❌ Coin not found or the service is busy. Try btc, eth, sol, bnb, xrp, doge."); }
    }
};
