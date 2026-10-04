const { commandResponse } = require("../../utils/branding");
const { sendCard } = require("../../utils/card");

module.exports = {
    name: "ping", aliases: ["p"], category: "general",
    permission: "public", description: "Check VORTEX response time.",
    usage: ".ping",
    async execute(context) {
        const start = Date.now();
        const sent = await context.sock.sendMessage(context.remoteJid,
            { text: "🏓 Pinging..." }, { quoted: context.message });
        const latency = Date.now() - start;

        const text = commandResponse(
`*🌀 VORTEX PING*

⚡ Latency : ${latency} ms
🤖 Status  : Online
⏱️ Uptime  : ${Math.floor(process.uptime() / 60)} min`);

        const left = await sendCard(context, "ping", text);
        if (left === null) {
            try { await context.sock.sendMessage(context.remoteJid, { delete: sent.key }); } catch {}
        } else {
            await context.sock.sendMessage(context.remoteJid, { text: left, edit: sent.key });
        }
        return null;
    }
};
