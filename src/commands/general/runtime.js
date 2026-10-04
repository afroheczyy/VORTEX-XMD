const {
    commandResponse
} = require("../../utils/branding");

module.exports = {
    name: "runtime",
    aliases: ["run"],
    category: "general",
    permission: "public",
    description: "Show VORTEX runtime information.",
    usage: ".runtime",

    async execute() {
        const memory =
            process.memoryUsage();

        const used =
            (memory.heapUsed / 1024 / 1024)
                .toFixed(1);

        const total =
            (memory.heapTotal / 1024 / 1024)
                .toFixed(1);

        return commandResponse(
`╭━━━〔 🌀 VORTEX RUNTIME 〕━━━╮
┃
┃  🤖 Node.js : ${process.version}
┃  📱 Platform : ${process.platform}
┃  🧠 Memory   : ${used} MB
┃  💾 Heap     : ${total} MB
┃  ⚡ PID      : ${process.pid}
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
