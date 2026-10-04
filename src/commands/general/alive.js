const {
    commandResponse
} = require("../../utils/branding");

module.exports = {
    name: "alive",
    category: "general",
    permission: "public",
    description: "Check whether VORTEX is online.",
    usage: ".alive",

    async execute() {
        return commandResponse(
`╭━━━〔 🌀 VORTEX XMD 〕━━━╮
┃
┃  ✅ VORTEX IS ONLINE
┃
┃  🤖 Version : 1.0.0
┃  ⚡ Status  : Active
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
