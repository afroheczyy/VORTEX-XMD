const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "ping",
    aliases: ["p"],
    category: "general",
    permission: "public",
    description: "Check VORTEX response time.",
    usage: ".ping",

    async execute(context) {
        const start = Date.now();

        const sent = await context.sock.sendMessage(
            context.remoteJid,
            { text: "🏓 Pinging..." },
            { quoted: context.message }
        );

        const latency = Date.now() - start;

        await context.sock.sendMessage(
            context.remoteJid,
            {
                text: commandResponse(
`╭━━━〔 🌀 VORTEX PING 〕━━━╮
┃
┃  ⚡ Latency : ${latency} ms
┃  🤖 Status  : ONLINE
╰━━━━━━━━━━━━━━━━━━━━━━╯`
                ),
                edit: sent.key
            }
        );

        return null;
    }
};
