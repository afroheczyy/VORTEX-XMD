const {
    commandResponse
} = require("../../utils/branding");

module.exports = {
    name: "botinfo",
    aliases: ["info"],
    category: "general",
    permission: "public",
    description: "Display VORTEX information.",
    usage: ".botinfo",

    async execute() {
        return commandResponse(
`╭━━━〔 🌀 VORTEX INFO 〕━━━╮
┃
┃  🤖 Name    : VORTEX XMD
┃  ⚡ Version : 1.0.0
┃  👑 Owner   : Hector
┃  🔰 Prefix  : .
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
