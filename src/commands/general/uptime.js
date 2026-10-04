const {
    commandResponse
} = require("../../utils/branding");

function formatUptime(seconds) {
    const days =
        Math.floor(seconds / 86400);

    seconds %= 86400;

    const hours =
        Math.floor(seconds / 3600);

    seconds %= 3600;

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

module.exports = {
    name: "uptime",
    aliases: ["up"],
    category: "general",
    permission: "public",
    description: "Show how long VORTEX has been running.",
    usage: ".uptime",

    async execute() {
        return commandResponse(
`╭━━━〔 🌀 VORTEX UPTIME 〕━━━╮
┃
┃  🟢 Status : ONLINE
┃  ⏱️ Uptime : ${formatUptime(process.uptime())}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
