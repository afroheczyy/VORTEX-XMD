const { commandResponse } = require("../../utils/branding");

module.exports = {
    name: "device",
    aliases: ["platform", "system"],
    category: "general",
    permission: "public",
    description: "Show the bot runtime platform.",
    usage: ".device",

    async execute() {
        return commandResponse(
`╭━━━〔 🌀 VORTEX DEVICE 〕━━━╮
┃
┃  🖥️ OS       : ${process.platform}
┃  🏗️ Arch     : ${process.arch}
┃  🤖 Node     : ${process.version}
┃  ⚡ PID      : ${process.pid}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
