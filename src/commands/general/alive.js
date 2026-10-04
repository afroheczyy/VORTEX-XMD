const config = require("../../../config/config");
const { commandResponse } = require("../../utils/branding");
const { sendCard } = require("../../utils/card");

module.exports = {
    name: "alive", aliases: ["online", "status"], category: "general",
    permission: "public", description: "Show that the bot is online.",
    usage: ".alive",
    async execute(context) {
        const s = Math.floor(process.uptime());
        const up = `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
        const mem = (process.memoryUsage().rss / 1048576).toFixed(0);
        const text = commandResponse(
`*🌀 VORTEX XMD IS ALIVE*

🟢 Status  : Online
👤 Owner   : ${config.owner.shortName}
⚡ Prefix  : ${config.bot.prefix}
⏱️ Uptime  : ${up}
💾 Memory  : ${mem} MB`);
        return await sendCard(context, "alive", text);
    }
};
