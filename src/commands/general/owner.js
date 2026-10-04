const {
    commandResponse
} = require("../../utils/branding");

const config =
    require("../../../config/config");

module.exports = {
    name: "owner",
    aliases: ["creator", "dev"],
    category: "general",
    permission: "public",
    description: "Show VORTEX owner information.",
    usage: ".owner",

    async execute() {
        return commandResponse(
`╭━━━〔 👑 VORTEX OWNER 〕━━━╮
┃
┃  👑 Name : ${config.owner.shortName}
┃
┃  🌀 VORTEX XMD
┃  ⚡ WhatsApp Automation
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
